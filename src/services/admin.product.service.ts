import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateProductInput, UpdateProductInput } from "../schemas/admin.product.schema";

export class AdminProductService {
    // 1. 상품 생성
    async createProduct(data: CreateProductInput) {
        // 카테고리 존재 확인
        const category = await prisma.category.findUnique({ where: { id: data.catId } });
        if (!category) throw new HttpException(404, "지정된 카테고리가 존재하지 않습니다.");

        const imageCreateData = data.images?.map(url => ({ url })) || [];

        return await prisma.product.create({
            data: {
                catId: data.catId,
                name: data.name,
                summary: data.summary,
                basePrice: data.basePrice,
                imageUrl: data.imageUrl,
                isDisplay: data.isDisplay,
                // 옵션 배열이 있으면 함께 생성
                options: {
                    create: data.options || [],
                },
                images: {
                    create: imageCreateData,
                },
            },
            include: { options: true, images: true },
        });
    }

    // 2. 상품 수정
    async updateProduct(id: number, data: UpdateProductInput) {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) throw new HttpException(404, "수정하려는 상품이 존재하지 않습니다.");

        const { options, images, ...productData } = data;
        const updateData: any = { ...productData };

        // 옵션 배열이 전달된 경우: 기존 옵션 싹 지우고 새로 생성 (Replace)
        if (options) {
            updateData.options = {
                deleteMany: {}, // 기존 옵션 전체 삭제
                create: options, // 새 옵션 생성
            };
        }

        if (images) {
            updateData.images = {
                deleteMany: {}, // 기존 이미지 전체 삭제
                create: images.map(url => ({ url })), // 새 이미지 생성
            };
        }

        return await prisma.product.update({
            where: { id },
            data: updateData,
            include: { options: true },
        });
    }

    // 3. 상품 삭제
    async deleteProduct(id: number) {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) throw new HttpException(404, "삭제하려는 상품이 존재하지 않습니다.");

        // Prisma Schema에서 onDelete: Cascade 설정되어 있다면 옵션도 자동 삭제됨
        await prisma.product.delete({
            where: { id },
        });

        return { message: "상품이 삭제되었습니다.", deletedId: id };
    }
}
