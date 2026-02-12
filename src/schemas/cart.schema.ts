import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const CartProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    basePrice: z.number(),
    imageUrl: z.string().nullable(),
    images: z
        .array(
            z.object({
                id: z.number(),
                url: z.string(),
            }),
        )
        .optional(),
});

const CartOptionSchema = z.object({
    id: z.number(),
    name: z.string(),
    value: z.string(),
    addPrice: z.number(),
});

const CartItemSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    memberId: z.number(),
    quantity: z.number().openapi({ example: 2 }),
    createdAt: z.date(),
    updatedAt: z.date(),

    prodId: z.number(),
    optionId: z.number().nullable(),
    product: CartProductSchema,
    option: CartOptionSchema.nullable(),
});

export const createCartBodySchema = z.object({
    prodId: z.number().int().positive().openapi({ example: 5 }),
    optionId: z.number().int().positive().nullable().optional().openapi({ example: 12 }),
    quantity: z.number().int().min(1).openapi({ example: 1 }),
});

export const updateCartBodySchema = z.object({
    quantity: z.number().int().min(1).openapi({ example: 3 }),
});

export const cartIdParamsSchema = z.object({
    id: z
        .string()
        .transform(Number)
        .refine(val => !isNaN(val), {
            message: "ID는 숫자여야 합니다.",
        })
        .openapi({ example: "1" }),
});

registry.registerPath({
    method: "get",
    path: "/api/cart",
    tags: ["Cart"],
    summary: "내 장바구니 목록 조회",
    responses: {
        200: {
            description: "성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: z.array(CartItemSchema) }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/cart",
    tags: ["Cart"],
    summary: "장바구니 추가",
    request: { body: { content: { "application/json": { schema: createCartBodySchema } } } },
    responses: { 201: { description: "추가 성공" } },
});

registry.registerPath({
    method: "patch",
    path: "/api/cart/{id}",
    tags: ["Cart"],
    summary: "수량 수정",
    request: {
        params: cartIdParamsSchema,
        body: { content: { "application/json": { schema: updateCartBodySchema } } },
    },
    responses: { 200: { description: "수정 성공" } },
});

registry.registerPath({
    method: "delete",
    path: "/api/cart/{id}",
    tags: ["Cart"],
    summary: "장바구니 삭제",
    request: { params: cartIdParamsSchema },
    responses: { 200: { description: "삭제 성공" } },
});
