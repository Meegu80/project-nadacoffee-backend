import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validateQuery, validateParams } from "../middlewares/validation.middleware";
import { productListQuerySchema, productIdParamSchema } from "../schemas/product.schema";

const productRouter = Router();
const productController = new ProductController();

productRouter.get("/", validateQuery(productListQuerySchema), productController.getProducts);
productRouter.get("/:id", validateParams(productIdParamSchema), productController.getProduct);

export default productRouter;
