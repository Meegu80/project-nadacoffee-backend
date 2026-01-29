import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const queryParams = {
                ...req.query,
                page,
                limit,
            };
            const result = await productService.getProducts(queryParams as any);
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
