import { HttpException } from "../utils/exception.utils";
import { prisma } from "../config/prisma";

export class AdminOrderService {
    async getAllOrders(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            prisma.order.count(),
            prisma.order.findMany({
                include: {
                    member: { select: { email: true, name: true } },
                    orderItems: {
                        include: {
                            product: { select: { name: true, imageUrl: true } },
                            option: { select: { name: true, value: true } },
                        },
                    },
                    payments: true,
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

    async getOrderDetail(orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                member: true,
                orderItems: { include: { product: true, option: true } },
                payments: true,
            },
        });
        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");
        return order;
    }

    async updateOrder(orderId: number, data: any) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");

        const updateData: any = { ...data };
        if (data.trackingNumber && !order.trackingNumber) {
            updateData.status = "배송중";
        }

        return await prisma.order.update({
            where: { id: orderId },
            data: updateData,
        });
    }
}
