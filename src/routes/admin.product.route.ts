import { Router } from "express";
import { AdminProductController } from "../controllers/admin.product.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import {
    createProductBodySchema,
    updateProductBodySchema,
    productIdParamSchema,
} from "../schemas/admin.product.schema";

const router = Router();
const controller = new AdminProductController();

router.use(authenticateJwt, isAdmin);

router.post("/", validateBody(createProductBodySchema), controller.createProduct);
router.put(
    "/:id",
    validateParams(productIdParamSchema),
    validateBody(updateProductBodySchema),
    controller.updateProduct,
);
router.delete("/:id", validateParams(productIdParamSchema), controller.deleteProduct);

export default router;
