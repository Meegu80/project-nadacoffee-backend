import { Request, Response, NextFunction } from "express";
import { PointService } from "../services/point.service";
import { Member } from "@prisma/client";

export class PointController {
    private pointService = new PointService();

    getPointBalance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const result = await this.pointService.getMyPointBalance(user.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getPointLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const result = await this.pointService.getMyPointLogs(user.id, page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
