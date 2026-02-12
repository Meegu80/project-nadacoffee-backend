import { prisma } from "../config/prisma";

export class CartService {
    async addToCart(
        memberId: number,
        data: { prodId: number; optionId?: number | null; quantity: number },
    ) {
        const optionId = data.optionId ?? null;

        const existing = await prisma.cart.findFirst({
            where: {
                memberId,
                prodId: data.prodId,
                optionId: optionId,
            },
        });

        if (existing) {
            return prisma.cart.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + data.quantity },
            });
        }

        return prisma.cart.create({
            data: {
                memberId,
                prodId: data.prodId,
                quantity: data.quantity,
                optionId: optionId,
            },
        });
    }

    async getCartItems(memberId: number) {
        return prisma.cart.findMany({
            where: { memberId },
            include: {
                product: {
                    include: {
                        images: {
                            select: { id: true, url: true },
                            orderBy: { id: "asc" },
                        },
                    },
                },
                option: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async updateQuantity(id: number, memberId: number, quantity: number) {
        return prisma.cart.update({
            where: { id, memberId },
            data: { quantity },
        });
    }

    async removeItem(id: number, memberId: number) {
        return prisma.cart.delete({
            where: { id, memberId },
        });
    }
}
