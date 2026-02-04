import { z } from "zod";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

const AdminOrderItemSchema = z.object({
    id: z.number(),
    prodId: z.number(),
    optionId: z.number().nullable(),
    quantity: z.number(),
    salePrice: z.number(),
    product: z.object({
        name: z.string(),
    }),
    option: z
        .object({
            name: z.string(),
            value: z.string(),
        })
        .nullable(),
});

export const AdminOrderSchema = z
    .object({
        id: z.number(),
        totalPrice: z.number(),
        status: z.string(),
        usedPoint: z.number(),
        recipientName: z.string(),
        recipientPhone: z.string(),
        zipCode: z.string(),
        address1: z.string(),
        address2: z.string(),
        deliveryMessage: z.string().nullable(),
        entrancePassword: z.string().nullable(),
        createdAt: z.date(),
        member: z.object({
            email: z.string(),
            name: z.string(),
        }),
        orderItems: z.array(AdminOrderItemSchema),
        payments: z.array(z.any()),
    })
    .openapi("AdminOrderDetail");

const PaginatedAdminOrderResponseSchema = createPaginatedResponseSchema(AdminOrderSchema);

export const updateOrderBodySchema = z
    .object({
        status: z
            .enum(["결제대기", "결제완료", "배송준비", "배송중", "배송완료", "취소완료"])
            .optional(),
        deliveryMessage: z.string().optional(),
        deliveryCompany: z.string().optional().openapi({ example: "CJ대한통운" }),
        trackingNumber: z.string().optional().openapi({ example: "1234567890" }),
    })
    .openapi("UpdateOrderBody");

registry.registerPath({
    method: "get",
    path: "/api/admin/orders",
    tags: ["Admin/Orders"],
    summary: "[관리자] 전체 주문 목록 조회",
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "성공",
            content: {
                "application/json": {
                    schema: PaginatedAdminOrderResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/orders/{id}",
    tags: ["Admin/Orders"],
    summary: "[관리자] 주문 상세 조회 (모든 정보 포함)",
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: AdminOrderSchema } },
        },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/admin/orders/{id}",
    tags: ["Admin/Orders"],
    summary: "[관리자] 주문 정보 수정",
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: updateOrderBodySchema } } },
    },
    responses: { 200: { description: "수정 성공" } },
});
