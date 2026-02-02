import { Request, Response, NextFunction } from "express";
import { AdminOrderService } from "../services/admin.order.service";

export class AdminOrderController {
    private adminOrderService = new AdminOrderService();

    getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const result = await this.adminOrderService.getAllOrders(page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orderId = Number(req.params.id);
            const result = await this.adminOrderService.getOrderDetail(orderId);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    };

    updateOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orderId = Number(req.params.id);
            const result = await this.adminOrderService.updateOrder(orderId, req.body);
            res.status(200).json({
                message: "주문 및 배송 정보가 수정되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
