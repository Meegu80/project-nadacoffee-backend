import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { ProductResponseSchema } from "./product.schema";

extendZodWithOpenApi(z);

// ------------------------------------------
// 1. 입력용 모델
// ------------------------------------------

// 상품 생성/수정 시 받을 옵션 데이터
const ProductOptionInputSchema = z.object({
    name: z.string().openapi({ example: "분쇄 선택" }),
    value: z.string().openapi({ example: "홀빈" }),
    addPrice: z.number().default(0).openapi({ example: 0 }),
    stockQty: z.number().default(0).openapi({ example: 100 }),
});

// [POST] 상품 생성 바디
export const createProductBodySchema = z.object({
    catId: z.number({ message: "카테고리는 필수입니다." }).openapi({ example: 1 }),
    name: z.string().min(1, "상품명은 필수입니다.").openapi({ example: "신규 원두" }),
    summary: z.string().optional().openapi({ example: "설명" }),
    basePrice: z.number().min(0).openapi({ example: 12000 }),
    imageUrl: z.string().nullable().optional().openapi({ example: "https://..." }),
    isDisplay: z.boolean().default(true).openapi({ example: true }),
    options: z.array(ProductOptionInputSchema).optional(),
    images: z
        .array(z.string())
        .optional()
        .openapi({
            example: ["https://s3.../img1.jpg", "https://s3.../img2.jpg"],
            description: "상세/추가 이미지 URL 리스트",
        }),
});

// [PUT] 상품 수정 바디
export const updateProductBodySchema = z.object({
    catId: z.number().optional(),
    name: z.string().optional(),
    summary: z.string().optional(),
    basePrice: z.number().optional(),
    imageUrl: z.string().nullable().optional(),
    isDisplay: z.boolean().optional(),
    options: z.array(ProductOptionInputSchema).optional(),
    images: z.array(z.string()).optional(),
});

// [PATH] ID 파라미터
export const productIdParamSchema = z.object({
    id: z.coerce.number().openapi({ example: 1, description: "상품 ID" }),
});

// Types
export type CreateProductInput = z.infer<typeof createProductBodySchema>;
export type UpdateProductInput = z.infer<typeof updateProductBodySchema>;

// ------------------------------------------
// 2. OpenAPI 경로 등록
// ------------------------------------------

// POST /api/admin/products
registry.registerPath({
    method: "post",
    path: "/api/admin/products",
    tags: ["Admin/Products"],
    summary: "상품 등록",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: createProductBodySchema } } },
    },
    responses: {
        201: {
            description: "생성 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: ProductResponseSchema }),
                },
            },
        },
    },
});

// PUT /api/admin/products/{id}
registry.registerPath({
    method: "put",
    path: "/api/admin/products/{id}",
    tags: ["Admin/Products"],
    summary: "상품 수정",
    description: "옵션 배열을 보낼 경우, 기존 옵션을 모두 삭제하고 새로 생성합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: productIdParamSchema,
        body: { content: { "application/json": { schema: updateProductBodySchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
    },
});

// DELETE /api/admin/products/{id}
registry.registerPath({
    method: "delete",
    path: "/api/admin/products/{id}",
    tags: ["Admin/Products"],
    summary: "상품 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: productIdParamSchema },
    responses: {
        200: { description: "삭제 성공" },
    },
});
