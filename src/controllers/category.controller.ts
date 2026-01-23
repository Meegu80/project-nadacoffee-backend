// src/controllers/category.controller.ts
import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export class CategoryController {
    // 전체 트리 조회
    async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getCategoryTree();
            res.status(200).json({
                message: "카테고리 목록 조회 성공",
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    // 단일 조회
    async getCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const category = await categoryService.getCategoryById(id);
            res.status(200).json({
                message: "카테고리 상세 조회 성공",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }
}
