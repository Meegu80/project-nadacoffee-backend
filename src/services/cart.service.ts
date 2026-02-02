import { prisma } from "../config/prisma";

export class CartService {
    async addToCart(
        memberId: number,
        data: { prodId: number; optionId: number; quantity: number },
    ) {
        const existing = await prisma.cart.findFirst({
            where: { memberId, prodId: data.prodId, optionId: data.optionId },
        });

        if (existing) {
            return prisma.cart.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + data.quantity },
            });
        }

        return prisma.cart.create({
            data: { memberId, ...data },
        });
    }

    async getCartItems(memberId: number) {
        return prisma.cart.findMany({
            where: { memberId },
            include: { product: true, option: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async updateQuantity(id: number, memberId: number, quantity: number) {
        return prisma.cart.update({
            where: { id, memberId }, // 본인 것인지 확인
            data: { quantity },
        });
    }

    async removeItem(id: number, memberId: number) {
        return prisma.cart.delete({
            where: { id, memberId },
        });
    }
}
