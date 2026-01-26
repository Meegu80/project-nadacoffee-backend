import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

export const CategorySchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        name: z.string().openapi({ example: "원두" }),
        parentId: z.number().nullable().openapi({ example: null }),
        depth: z.number().openapi({ example: 1 }),
        sortOrder: z.number().openapi({ example: 0 }),
    })
    .openapi("Category");

export const createCategoryBodySchema = z.object({
    name: z.string().min(1, "카테고리 이름은 필수입니다.").openapi({ example: "에티오피아" }),
    parentId: z.number().optional().openapi({ example: 1, description: "상위 카테고리 ID" }),
    sortOrder: z.number().optional().openapi({ example: 1 }),
});

export const updateCategoryBodySchema = z.object({
    name: z.string().optional().openapi({ example: "수정된 이름" }),
    parentId: z.number().optional().nullable(),
    sortOrder: z.number().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryBodySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryBodySchema>;

registry.registerPath({
    method: "post",
    path: "/api/admin/categories",
    tags: ["Admin Category"],
    summary: "카테고리 생성",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createCategoryBodySchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "생성 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: CategorySchema,
                    }),
                },
            },
        },
        400: { description: "유효성 검사 실패" },
    },
});

registry.registerPath({
    method: "put",
    path: "/api/admin/categories/{id}",
    tags: ["Admin Category"],
    summary: "카테고리 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }), // URL 파라미터 정의
        body: {
            content: {
                "application/json": {
                    schema: updateCategoryBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "수정 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: CategorySchema,
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/categories/{id}",
    tags: ["Admin Category"],
    summary: "카테고리 삭제",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: {
            description: "삭제 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        deletedId: z.number(),
                    }),
                },
            },
        },
    },
});
