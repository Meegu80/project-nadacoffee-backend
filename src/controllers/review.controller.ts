import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { Member } from "@prisma/client";

export class ReviewController {
    private reviewService = new ReviewService();

    createReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const result = await this.reviewService.createReview(user.id, req.body);
            res.status(201).json({ message: "리뷰가 등록되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    };

    updateReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const reviewId = Number(req.params.id);
            const result = await this.reviewService.updateReview(user.id, reviewId, req.body);
            res.status(200).json({ message: "리뷰가 수정되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    };

    getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await this.reviewService.getMyReviews(user.id, page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const prodId = Number(req.params.prodId);
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await this.reviewService.getProductReviews(prodId, page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    deleteReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const reviewId = Number(req.params.id);
            await this.reviewService.deleteReview(user.id, reviewId);
            res.status(200).json({ message: "리뷰가 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
