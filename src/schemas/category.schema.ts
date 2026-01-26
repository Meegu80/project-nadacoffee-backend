import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const BaseCategorySchema = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Coffee" }),
    parentId: z.number().nullable().openapi({ example: null }),
    depth: z.number().openapi({ example: 1 }),
    sortOrder: z.number().openapi({ example: 1 }),
});

export const CategoryTreeSchema: z.ZodType<any> = BaseCategorySchema.extend({
    categories: z.lazy(() => z.array(CategoryTreeSchema)).optional(),
}).openapi("CategoryTree");

export const CategoryDetailSchema = BaseCategorySchema.extend({
    categories: z.array(BaseCategorySchema).optional(),
    parent: BaseCategorySchema.nullable().optional(),
}).openapi("CategoryDetail");

export const categoryIdParamsSchema = z.object({
    id: z
        .string()
        .transform(val => Number(val))
        .refine(val => !isNaN(val), {
            message: "ID는 숫자여야 합니다.",
        })
        .openapi({ example: "1", description: "카테고리 ID" }),
});

registry.registerPath({
    method: "get",
    path: "/api/categories",
    tags: ["Category"],
    summary: "전체 카테고리 목록 조회 (트리 구조)",
    description: "쇼핑몰 메뉴 구성을 위한 계층형 카테고리 데이터를 반환합니다.",
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.array(CategoryTreeSchema),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/categories/{id}",
    tags: ["Category"],
    summary: "카테고리 상세 조회",
    request: {
        params: categoryIdParamsSchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: CategoryDetailSchema,
                    }),
                },
            },
        },
        404: { description: "존재하지 않는 카테고리" },
    },
});
