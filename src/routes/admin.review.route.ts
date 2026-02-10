import { Router } from "express";
import { AdminReviewController } from "../controllers/admin.review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateQuery, validateParams } from "../middlewares/validation.middleware";
import { getAdminReviewQuerySchema } from "../schemas/admin.review.schema";
import { z } from "zod";

const adminReviewRouter = Router();
const adminReviewController = new AdminReviewController();

// 모든 요청에 관리자 권한 필요
adminReviewRouter.use(authenticateJwt, isAdmin);

// 전체 목록 조회 (검색)
adminReviewRouter.get(
    "/",
    validateQuery(getAdminReviewQuerySchema),
    adminReviewController.getAllReviews,
);

// 리뷰 삭제
adminReviewRouter.delete(
    "/:id",
    validateParams(z.object({ id: z.coerce.number() })),
    adminReviewController.deleteReview,
);

export default adminReviewRouter;
