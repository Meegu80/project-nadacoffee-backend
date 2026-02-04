import axios from "axios";
import { HttpException } from "../utils/exception.utils";
import { prisma } from "../config/prisma";
import { PaymentStatus } from "@prisma/client";

export class OrderService {
    async createOrder(memberId: number, data: any) {
        return await prisma.$transaction(async tx => {
            let totalProductPrice = 0;
            const itemsToCreate = [];

            for (const item of data.items) {
                const product = await tx.product.findUnique({ where: { id: item.prodId } });
                if (!product) throw new HttpException(404, "상품 정보를 찾을 수 없습니다.");

                let price = product.basePrice;
                let optionId: number | null = null;

                if (item.optionId) {
                    const option = await tx.prodOption.findUnique({ where: { id: item.optionId } });
                    if (!option)
                        throw new HttpException(404, "선택한 옵션 정보를 찾을 수 없습니다.");

                    price += option.addPrice; // 옵션 추가금 합산
                    optionId = option.id;
                }

                totalProductPrice += price * item.quantity;

                itemsToCreate.push({
                    prodId: item.prodId,
                    optionId: optionId, // null 가능
                    quantity: item.quantity,
                    salePrice: price, // 계산된 단가 저장
                });
            }

            const finalPrice = totalProductPrice - data.usePoint;
            if (finalPrice < 0) throw new HttpException(400, "사용 포인트가 총 금액보다 큽니다.");

            return await tx.order.create({
                data: {
                    memberId,
                    totalPrice: finalPrice,
                    usedPoint: data.usePoint,
                    recipientName: data.recipientName,
                    recipientPhone: data.recipientPhone,
                    zipCode: data.zipCode,
                    address1: data.address1,
                    address2: data.address2,
                    deliveryMessage: data.deliveryMessage,
                    entrancePassword: data.entrancePassword,
                    orderItems: { create: itemsToCreate },
                },
            });
        });
    }

    async confirmPayment(
        memberId: number,
        payload: { orderId: number; paymentKey: string; amount: number },
    ) {
        const { orderId, paymentKey, amount } = payload;

        try {
            const secretKey = process.env.TOSS_SECRET_KEY;
            const basicAuth = Buffer.from(secretKey + ":").toString("base64");

            await axios.post(
                "https://api.tosspayments.com/v1/payments/confirm",
                { orderId: `ORDER_${orderId}`, amount, paymentKey },
                {
                    headers: {
                        Authorization: `Basic ${basicAuth}`,
                        "Content-Type": "application/json",
                    },
                },
            );
        } catch (e: any) {
            console.error(e.response?.data || e.message);
            throw new HttpException(400, "결제 승인 과정에서 오류가 발생했습니다.");
        }

        return await prisma.$transaction(async tx => {
            const order = await tx.order.findUnique({
                where: { id: orderId, memberId },
                include: { orderItems: true },
            });

            if (!order) throw new HttpException(404, "해당 주문을 찾을 수 없습니다.");

            for (const item of order.orderItems) {
                if (item.optionId) {
                    const option = await tx.prodOption.findUnique({ where: { id: item.optionId } });

                    if (!option || option.stockQty < item.quantity) {
                        throw new HttpException(
                            400,
                            `상품([옵션] ${option?.name})의 재고가 부족합니다.`,
                        );
                    }

                    await tx.prodOption.update({
                        where: { id: item.optionId },
                        data: { stockQty: { decrement: item.quantity } },
                    });
                }
            }

            // 포인트 로그 기록
            if (order.usedPoint > 0) {
                await tx.pointLog.create({
                    data: {
                        memberId,
                        orderId: order.id,
                        amount: -order.usedPoint,
                        reason: "상품 구매 포인트 사용",
                    },
                });
            }

            await tx.payment.create({
                data: {
                    orderId: order.id,
                    method: "TOSS_PAYMENTS",
                    pgTid: paymentKey,
                    amount: amount,
                    status: "PAID",
                },
            });

            return await tx.order.update({
                where: { id: orderId },
                data: { status: "결제완료" },
            });
        });
    }

    async getMyOrders(memberId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            prisma.order.count({ where: { memberId } }),
            prisma.order.findMany({
                where: { memberId },
                include: {
                    orderItems: {
                        include: { product: true, option: true },
                    },
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

    async getOrderDetail(memberId: number, orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: { product: true, option: true },
                },
                payments: true,
            },
        });

        if (!order || order.memberId !== memberId) {
            throw new HttpException(404, "주문 내역을 찾을 수 없습니다.");
        }

        return order;
    }

    async cancelOrder(memberId: number, orderId: number, reason: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId, memberId },
            include: { orderItems: true, payments: true },
        });

        if (!order) throw new HttpException(404, "주문 내역을 찾을 수 없습니다.");

        // 배송 시작 이후에는 취소 불가 (정책에 따라 조정)
        if (["배송중", "배송완료", "취소완료"].includes(order.status)) {
            throw new HttpException(400, "현재 상태에서는 주문을 취소할 수 없습니다.");
        }

        const payment = order.payments.find(p => p.status === "PAID");

        // 1. 이미 결제가 된 경우 토스페이먼츠 취소 API 호출
        if (payment) {
            try {
                const secretKey = process.env.TOSS_SECRET_KEY;
                const basicAuth = Buffer.from(secretKey + ":").toString("base64");

                await axios.post(
                    `https://api.tosspayments.com/v1/payments/${payment.pgTid}/cancel`,
                    { cancelReason: reason },
                    {
                        headers: {
                            Authorization: `Basic ${basicAuth}`,
                            "Content-Type": "application/json",
                        },
                    },
                );
            } catch (e: any) {
                console.error(e.response?.data || e.message);
                throw new HttpException(400, "결제 취소 처리 중 오류가 발생했습니다.");
            }
        }

        // 2. DB 후처리 (상태 변경, 재고 복구, 포인트 환불)
        return await prisma.$transaction(async tx => {
            // A. 재고 복구 (결제완료 상태였을 때만)
            if (order.status === "결제완료") {
                for (const item of order.orderItems) {
                    // 옵션이 있는 상품만 재고 복구
                    if (item.optionId) {
                        await tx.prodOption.update({
                            where: { id: item.optionId },
                            data: { stockQty: { increment: item.quantity } },
                        });
                    }
                }
            }

            // B. 포인트 환불
            if (order.usedPoint > 0) {
                await tx.pointLog.create({
                    data: {
                        memberId,
                        orderId: order.id,
                        amount: order.usedPoint, // 사용했던 만큼 플러스(+)
                        reason: "주문 취소에 따른 포인트 환불",
                    },
                });
            }

            // C. 결제 레코드 상태 변경
            if (payment) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.CANCELLED },
                });
            }

            // D. 주문 상태 변경
            return await tx.order.update({
                where: { id: orderId },
                data: { status: "취소완료" },
            });
        });
    }
}
