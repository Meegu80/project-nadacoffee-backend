import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

// ------------------------------------------
// 1. 공통 데이터 모델
// ------------------------------------------

const ProductOptionSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "분쇄 선택" }),
    value: z.string().openapi({ example: "홀빈" }),
    addPrice: z.number().openapi({ example: 0 }),
    stockQty: z.number().openapi({ example: 50 }),
});

const CategorySimpleSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const ProductResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        name: z.string().openapi({ example: "에티오피아 예가체프" }),
        summary: z.string().nullable().openapi({ example: "설명" }),
        basePrice: z.number().openapi({ example: 15000 }),
        imageUrl: z.string().nullable().openapi({ example: "https://..." }),
        isDisplay: z.boolean().openapi({ example: true }),
        catId: z.number().openapi({ example: 10 }),
        category: CategorySimpleSchema.optional(),
        options: z.array(ProductOptionSchema).optional(),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .openapi("ProductResponse");

export const productListQuerySchema = PaginationQuerySchema.extend({
    catId: z.coerce.number().optional().openapi({ description: "카테고리 ID" }),
    search: z.string().optional().openapi({ description: "검색어" }),
    isDisplay: z.enum(["true", "false"]).optional().openapi({
        description: "진열 여부 필터 (true: 진열됨, false: 숨김, 미전송: 전체)",
    }),
    sort: z.enum(["latest", "price_asc", "price_desc"]).default("latest").optional().openapi({
        description: "정렬 기준 (기본값: latest)",
        example: "price_asc",
    }),
});

// [GET] 상세 조회 파라미터
export const productIdParamSchema = z.object({
    id: z.coerce.number().openapi({ example: 1, description: "상품 ID" }),
});

// Types
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

// ------------------------------------------
// 3. OpenAPI 경로 등록
// ------------------------------------------

registry.registerPath({
    method: "get",
    path: "/api/products",
    tags: ["Product (Public)"],
    summary: "상품 목록 조회",
    description: "검색어, 카테고리, 진열 여부(isDisplay) 등을 조합하여 상품을 조회합니다.",
    request: {
        query: productListQuerySchema,
    },
    responses: {
        200: {
            description: "성공",
            content: {
                "application/json": {
                    schema: createPaginatedResponseSchema(ProductResponseSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/products/{id}",
    tags: ["Product (Public)"],
    summary: "상품 상세 조회",
    request: {
        params: productIdParamSchema,
    },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: z.object({ data: ProductResponseSchema }) } },
        },
        404: { description: "상품 없음" },
    },
});
