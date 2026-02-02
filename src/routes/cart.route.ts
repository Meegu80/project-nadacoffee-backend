import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import {
    createCartBodySchema,
    updateCartBodySchema,
    cartIdParamsSchema,
} from "../schemas/cart.schema";

const cartRouter = Router();
const cartController = new CartController();

cartRouter.use(authenticateJwt);

cartRouter.get("/", cartController.getCartList);
cartRouter.post("/", validateBody(createCartBodySchema), cartController.addToCart);
cartRouter.patch(
    "/:id",
    validateParams(cartIdParamsSchema),
    validateBody(updateCartBodySchema),
    cartController.updateQuantity,
);
cartRouter.delete("/:id", validateParams(cartIdParamsSchema), cartController.deleteItem);

export default cartRouter;
