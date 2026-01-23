import { Router } from "express";
import { AdminCategoryController } from "../controllers/admin.category.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const adminCategoryRouter = Router();
const adminCategoryController = new AdminCategoryController();

adminCategoryRouter.use(authenticateJwt, isAdmin);

adminCategoryRouter.post("/", adminCategoryController.createCategory);
adminCategoryRouter.put("/:id", adminCategoryController.updateCategory);
adminCategoryRouter.delete("/:id", adminCategoryController.deleteCategory);

export default adminCategoryRouter;
