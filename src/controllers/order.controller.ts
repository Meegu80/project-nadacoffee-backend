import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { Member } from "@prisma/client";

export class OrderController {
    private orderService = new OrderService();

    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const order = await this.orderService.createOrder(user.id, req.body);
            res.status(201).json({
                message: "주문서가 생성되었습니다.",
                orderId: order.id,
                amount: order.totalPrice,
            });
        } catch (error) {
            next(error);
        }
    };

    confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const result = await this.orderService.confirmPayment(user.id, req.body);
            res.status(200).json({ message: "결제가 성공적으로 완료되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    };

    getOrderList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const result = await this.orderService.getMyOrders(user.id, page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const orderId = Number(req.params.id);

            const order = await this.orderService.getOrderDetail(user.id, orderId);
            res.status(200).json({ data: order });
        } catch (error) {
            next(error);
        }
    };

    cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const orderId = Number(req.params.id);
            const { reason } = req.body;

            await this.orderService.cancelOrder(user.id, orderId, reason);

            res.status(200).json({ message: "주문이 성공적으로 취소되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
