import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/admin.category.schema";

export class AdminCategoryService {
    async createCategory(data: CreateCategoryInput) {
        let depth = 1;

        if (data.parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: data.parentId },
            });

            if (!parent) {
                throw new HttpException(404, "지정된 상위 카테고리가 존재하지 않습니다.");
            }
            depth = parent.depth + 1;
        }

        return await prisma.category.create({
            data: {
                name: data.name,
                parentId: data.parentId ?? null, // undefined일 경우 null 처리
                depth: depth,
                sortOrder: data.sortOrder ?? 0,
            },
        });
    }

    async updateCategory(id: number, data: UpdateCategoryInput) {
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new HttpException(404, "수정하려는 카테고리가 존재하지 않습니다.");
        }

        let depth = existingCategory.depth;

        // parentId가 undefined가 아니고(값 변경 시도), 기존 값과 다를 때만 로직 수행
        if (data.parentId !== undefined && data.parentId !== existingCategory.parentId) {
            if (data.parentId === null) {
                depth = 1;
            } else {
                const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
                if (!parent) throw new HttpException(404, "지정된 상위 카테고리가 없습니다.");
                depth = parent.depth + 1;
            }
        }

        return await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                parentId: data.parentId,
                sortOrder: data.sortOrder,
                depth: depth,
            },
        });
    }

    async deleteCategory(id: number) {
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new HttpException(404, "삭제하려는 카테고리가 존재하지 않습니다.");
        }

        await prisma.category.delete({
            where: { id },
        });

        return { message: "카테고리가 삭제되었습니다.", deletedId: id };
    }
}
