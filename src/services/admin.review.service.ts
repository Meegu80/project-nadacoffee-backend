import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

export class AdminReviewService {
    // 1. 전체 리뷰 조회 (검색 및 페이징)
    async getAllReviews(params: {
        page: number;
        limit: number;
        prodId?: number;
        memberId?: number;
        search?: string;
    }) {
        const { page, limit, prodId, memberId, search } = params;
        const skip = (page - 1) * limit;

        // 동적 필터 조건 생성
        const where: Prisma.ReviewWhereInput = {};

        if (prodId) where.prodId = prodId;
        if (memberId) where.memberId = memberId;
        if (search) {
            where.content = { contains: search }; // 부분 일치 검색
        }

        const [total, items] = await Promise.all([
            prisma.review.count({ where }),
            prisma.review.findMany({
                where,
                include: {
                    member: { select: { id: true, email: true, name: true } },
                    product: { select: { id: true, name: true, imageUrl: true } },
                    reviewImages: { select: { id: true, url: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: items,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    // 2. 리뷰 강제 삭제
    async deleteReview(reviewId: number) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");

        // 이미지와 리뷰 삭제 (DB Cascade 설정이 없다면 순서 중요)
        return await prisma.$transaction(async tx => {
            await tx.reviewImage.deleteMany({ where: { reviewId } });
            await tx.review.delete({ where: { id: reviewId } });
        });
    }
}
