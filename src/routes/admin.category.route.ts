import { Router } from "express";
import { AdminCategoryController } from "../controllers/admin.category.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
    createCategoryBodySchema,
    updateCategoryBodySchema,
} from "../schemas/admin.category.schema";

const adminCategoryRouter = Router();
const adminCategoryController = new AdminCategoryController();

adminCategoryRouter.use(authenticateJwt, isAdmin);
adminCategoryRouter.post(
    "/",
    validateBody(createCategoryBodySchema),
    adminCategoryController.createCategory,
);
adminCategoryRouter.put(
    "/:id",
    validateBody(updateCategoryBodySchema),
    adminCategoryController.updateCategory,
);
adminCategoryRouter.delete("/:id", adminCategoryController.deleteCategory);

export default adminCategoryRouter;
