import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

interface CreateCategoryDto {
    name: string;
    parentId?: number;
    sortOrder?: number;
}

interface UpdateCategoryDto {
    name?: string;
    parentId?: number;
    sortOrder?: number;
}

export class AdminCategoryService {
    async createCategory(data: CreateCategoryDto) {
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
                parentId: data.parentId || null,
                depth: depth,
                sortOrder: data.sortOrder || 0,
            },
        });
    }

    async updateCategory(id: number, data: UpdateCategoryDto) {
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new HttpException(404, "수정하려는 카테고리가 존재하지 않습니다.");
        }

        let depth = existingCategory.depth;
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
