import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middlewares/validation.middleware";
import { createReviewBodySchema, updateReviewBodySchema } from "../schemas/review.schema";
import { PaginationQuerySchema } from "../schemas/common.schema";
import { z } from "zod";

const reviewRouter = Router();
const reviewController = new ReviewController();

// 1. [Public] 상품 별 리뷰 목록 조회
reviewRouter.get(
    "/product/:prodId",
    validateParams(z.object({ prodId: z.coerce.number() })),
    validateQuery(PaginationQuerySchema),
    reviewController.getProductReviews,
);

// 2. [Private] 인증 필요
reviewRouter.use(authenticateJwt);

reviewRouter.get("/me", validateQuery(PaginationQuerySchema), reviewController.getMyReviews);
reviewRouter.post("/", validateBody(createReviewBodySchema), reviewController.createReview);
reviewRouter.patch(
    "/:id",
    validateParams(z.object({ id: z.coerce.number() })),
    validateBody(updateReviewBodySchema),
    reviewController.updateReview,
);
reviewRouter.delete(
    "/:id",
    validateParams(z.object({ id: z.coerce.number() })),
    reviewController.deleteReview,
);

export default reviewRouter;
