import { Router } from "express";
import { AdminPointsController } from "../controllers/admin.points.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { givePointBodySchema, giveBulkPointBodySchema } from "../schemas/admin.points.schema";

const adminPointsRouter = Router();
const adminPointsController = new AdminPointsController();

adminPointsRouter.use(authenticateJwt, isAdmin);

adminPointsRouter.post("/", validateBody(givePointBodySchema), adminPointsController.givePoint);
adminPointsRouter.post(
    "/bulk-all",
    validateBody(giveBulkPointBodySchema),
    adminPointsController.giveBulkPoint,
);

export default adminPointsRouter;
