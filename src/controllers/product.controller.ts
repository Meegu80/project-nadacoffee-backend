import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            // isDisplay가 포함된 쿼리를 서비스로 전달
            const result = await productService.getProducts(req.query as any);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await productService.getProductById(id);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}
