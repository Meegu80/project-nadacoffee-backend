import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateQuery } from "../middlewares/validation.middleware";
import {
    createOrderBodySchema,
    confirmOrderBodySchema,
    cancelOrderBodySchema,
} from "../schemas/order.schema";
import { PaginationQuerySchema } from "../schemas/common.schema";

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.use(authenticateJwt);

orderRouter.get("/", validateQuery(PaginationQuerySchema), orderController.getOrderList);
orderRouter.get("/:id", orderController.getOrderDetail);
orderRouter.post("/", validateBody(createOrderBodySchema), orderController.createOrder);
orderRouter.post("/confirm", validateBody(confirmOrderBodySchema), orderController.confirmOrder);
orderRouter.post("/:id/cancel", validateBody(cancelOrderBodySchema), orderController.cancelOrder);

export default orderRouter;
