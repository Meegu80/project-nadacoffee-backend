import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

export class CategoryService {
    async getCategoryTree() {
        return await prisma.category.findMany({
            where: {
                parentId: null,
            },
            include: {
                categories: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        categories: {
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    async getCategoryById(catId: number) {
        const category = await prisma.category.findUnique({
            where: { id: catId },
            include: {
                categories: true,
                parent: true,
            },
        });

        if (!category) {
            throw new HttpException(404, "존재하지 않는 카테고리입니다.");
        }

        return category;
    }
}
