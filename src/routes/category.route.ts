import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { categoryIdParamsSchema } from "../schemas/category.schema";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/:id", validateParams(categoryIdParamsSchema), categoryController.getCategory);

export default categoryRouter;
