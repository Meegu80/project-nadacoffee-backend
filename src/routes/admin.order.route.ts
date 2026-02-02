import { Router } from "express";
import { AdminOrderController } from "../controllers/admin.order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware"; // isAdmin 미들웨어 필요
import { validateBody, validateQuery } from "../middlewares/validation.middleware";
import { PaginationQuerySchema } from "../schemas/common.schema";
import { updateOrderBodySchema } from "../schemas/admin.order.schema";
import { isAdmin } from "../middlewares/admin.middleware";

const adminOrderRouter = Router();
const adminOrderController = new AdminOrderController();

adminOrderRouter.use(authenticateJwt, isAdmin);

adminOrderRouter.get("/", validateQuery(PaginationQuerySchema), adminOrderController.getAllOrders);
adminOrderRouter.get("/:id", adminOrderController.getOrderDetail);
adminOrderRouter.patch(
    "/:id",
    validateBody(updateOrderBodySchema),
    adminOrderController.updateOrder,
);

export default adminOrderRouter;
