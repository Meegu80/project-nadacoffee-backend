import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { ProductListQuery } from "../schemas/product.schema";

export class ProductService {
    // 상품 목록 조회
    async getProducts(query: ProductListQuery) {
        const { page, limit, catId, search, isDisplay, sort } = query;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (catId) {
            where.catId = catId;
        }

        if (search) {
            where.name = { contains: search };
        }

        if (isDisplay) {
            where.isDisplay = isDisplay === "true";
        }

        let orderBy: any = { createdAt: "desc" };
        if (sort === "price_asc") {
            orderBy = { basePrice: "asc" };
        } else if (sort === "price_desc") {
            orderBy = { basePrice: "desc" };
        }

        const [total, products] = await prisma.$transaction([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: { select: { id: true, name: true } },
                    options: true,
                    images: {
                        select: { id: true, url: true },
                        orderBy: { id: "asc" },
                    },
                },
            }),
        ]);

        return {
            data: products,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    // 상품 상세 조회
    async getProductById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
                options: {
                    orderBy: { addPrice: "asc" },
                },
                images: {
                    select: { id: true, url: true },
                    orderBy: { id: "asc" },
                },
            },
        });

        if (!product) {
            throw new HttpException(404, "상품을 찾을 수 없습니다.");
        }

        return product;
    }
}
