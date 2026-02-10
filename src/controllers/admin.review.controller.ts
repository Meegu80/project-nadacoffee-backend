import { Request, Response, NextFunction } from "express";
import { AdminReviewService } from "../services/admin.review.service";

export class AdminReviewController {
    private adminReviewService = new AdminReviewService();

    getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const prodId = req.query.prodId ? Number(req.query.prodId) : undefined;
            const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;
            const search = req.query.search as string | undefined;

            const result = await this.adminReviewService.getAllReviews({
                page,
                limit,
                prodId,
                memberId,
                search,
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    deleteReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = Number(req.params.id);
            await this.adminReviewService.deleteReview(reviewId);
            res.status(200).json({ message: "리뷰가 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
