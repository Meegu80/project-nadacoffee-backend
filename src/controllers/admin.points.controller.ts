import { Request, Response, NextFunction } from "express";
import { AdminPointsService } from "../services/admin.points.service";

export class AdminPointsController {
    private adminPointsService = new AdminPointsService();

    // 개별 지급
    givePoint = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminPointsService.givePoint(req.body);
            res.status(201).json({
                message: "포인트가 지급되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // 전체 일괄 지급
    giveBulkPoint = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.adminPointsService.giveBulkPoint(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };
}
