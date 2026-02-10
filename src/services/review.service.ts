import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

export class ReviewService {
    // 1. 리뷰 등록
    async createReview(
        memberId: number,
        data: {
            orderId: number;
            prodId: number;
            rating: number;
            content: string;
            imageUrls?: string[];
        },
    ) {
        const order = await prisma.order.findUnique({
            where: { id: data.orderId },
            include: { orderItems: true },
        });

        if (!order) throw new HttpException(404, "주문 정보를 찾을 수 없습니다.");
        if (order.memberId !== memberId)
            throw new HttpException(403, "본인의 주문에만 리뷰를 쓸 수 있습니다.");

        const hasProduct = order.orderItems.some(item => item.prodId === data.prodId);
        if (!hasProduct) throw new HttpException(400, "해당 주문에 포함되지 않은 상품입니다.");

        try {
            // Review 생성 + ReviewImage 동시 생성 (Nested Write)
            return await prisma.review.create({
                data: {
                    memberId,
                    orderId: data.orderId,
                    prodId: data.prodId,
                    rating: data.rating,
                    content: data.content,
                    reviewImages: {
                        create: data.imageUrls?.map(url => ({ url })) || [],
                    },
                },
                include: { reviewImages: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpException(409, "이미 해당 주문 상품에 대한 리뷰를 작성하셨습니다.");
            }
            throw error;
        }
    }

    // 2. 리뷰 수정
    async updateReview(
        memberId: number,
        reviewId: number,
        data: { rating?: number; content?: string; imageUrls?: string[] },
    ) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");
        if (review.memberId !== memberId)
            throw new HttpException(403, "본인의 리뷰만 수정할 수 있습니다.");

        // Transaction을 사용하여 이미지 교체 안전성 보장
        return await prisma.$transaction(async tx => {
            // 이미지 URL 배열이 전달된 경우: 기존 이미지 삭제 후 재등록 (덮어쓰기 로직)
            if (data.imageUrls) {
                // 1. 기존 이미지 삭제
                await tx.reviewImage.deleteMany({
                    where: { reviewId },
                });

                // 2. 새 이미지 등록 (배열이 비어있으면 삭제만 되고 끝남)
                if (data.imageUrls.length > 0) {
                    await tx.reviewImage.createMany({
                        data: data.imageUrls.map(url => ({
                            reviewId,
                            url,
                        })),
                    });
                }
            }

            // 3. 리뷰 내용 업데이트
            return await tx.review.update({
                where: { id: reviewId },
                data: {
                    rating: data.rating,
                    content: data.content,
                },
                include: { reviewImages: true },
            });
        });
    }

    // 3. 내 리뷰 목록
    async getMyReviews(memberId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            prisma.review.count({ where: { memberId } }),
            prisma.review.findMany({
                where: { memberId },
                include: {
                    member: { select: { name: true } },
                    product: { select: { id: true, name: true, imageUrl: true } },
                    reviewImages: { select: { id: true, url: true } }, // 이미지 포함
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: items,
            pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
        };
    }

    // 4. 상품 별 리뷰 목록
    async getProductReviews(prodId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            prisma.review.count({ where: { prodId } }),
            prisma.review.findMany({
                where: { prodId },
                include: {
                    member: { select: { name: true } },
                    reviewImages: { select: { id: true, url: true } }, // 이미지 포함
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: items,
            pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
        };
    }

    // 5. 리뷰 삭제 (Cascade 설정이 되어있지 않다면 이미지 먼저 삭제 필요할 수 있음)
    // Prisma Schema에서 onDelete: Cascade 설정이 권장됨.
    // 만약 설정 안 했다면 여기서 reviewImage deleteMany 먼저 수행해야 함.
    async deleteReview(memberId: number, reviewId: number) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");
        if (review.memberId !== memberId)
            throw new HttpException(403, "본인의 리뷰만 삭제할 수 있습니다.");

        // 스키마에 Cascade 설정이 없다고 가정하고 안전하게 이미지 먼저 삭제
        await prisma.reviewImage.deleteMany({ where: { reviewId } });

        return await prisma.review.delete({
            where: { id: reviewId },
        });
    }
}
