import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const categoryRouter = Router();
const categoryController = new CategoryController();

// Public Routes
categoryRouter.get("/", categoryController.getCategories); // 전체 트리 조회
categoryRouter.get("/:id", categoryController.getCategory); // 상세 조회

export default categoryRouter;
