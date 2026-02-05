import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

const OrderItemInputSchema = z.object({
    prodId: z.number().int().positive(),
    optionId: z.number().int().positive().nullable().optional(),
    quantity: z.number().int().min(1),
});

export const createOrderBodySchema = z
    .object({
        items: z.array(OrderItemInputSchema).min(1, "주문 상품이 없습니다."),
        recipientName: z.string().min(1, "이름을 입력해주세요."),
        recipientPhone: z.string().min(1, "연락처를 입력해주세요."),
        zipCode: z.string().min(1, "우편번호를 입력해주세요."),
        address1: z.string().min(1, "기본 주소를 입력해주세요."),
        address2: z.string().min(1, "상세 주소를 입력해주세요."),
        deliveryMessage: z.string().optional(),
        entrancePassword: z.string().optional(),
        usePoint: z.number().int().min(0).default(0),
    })
    .openapi("CreateOrderBody");

export const confirmOrderBodySchema = z
    .object({
        orderId: z.string().openapi({ example: "ORDER_35_1770261985770" }),
        paymentKey: z.string(),
        amount: z.number().int(),
    })
    .openapi("ConfirmOrderBody");

const OrderItemDetailSchema = z.object({
    id: z.number(),
    quantity: z.number(),
    salePrice: z.number(),
    product: z.object({
        name: z.string(),
        imageUrl: z.string().nullable(),
    }),
    option: z
        .object({
            name: z.string(),
            value: z.string(),
        })
        .nullable(),
});

export const OrderDetailSchema = z
    .object({
        id: z.number(),
        totalPrice: z.number(),
        status: z.string(),
        createdAt: z.date(),
        recipientName: z.string(),
        recipientPhone: z.string(),
        zipCode: z.string(),
        address1: z.string(),
        address2: z.string(),
        deliveryMessage: z.string().nullable(),
        usedPoint: z.number(),
        orderItems: z.array(OrderItemDetailSchema),
    })
    .openapi("OrderDetail");

const PaginatedOrderSchema = createPaginatedResponseSchema(OrderDetailSchema);

export const cancelOrderBodySchema = z
    .object({
        reason: z.string().min(1, "취소 사유를 입력해주세요.").openapi({ example: "단순 변심" }),
    })
    .openapi("CancelOrderBody");

registry.registerPath({
    method: "get",
    path: "/api/orders",
    tags: ["Orders"],
    summary: "내 주문 목록 조회 (페이징)",
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PaginatedOrderSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/orders/{id}",
    tags: ["Orders"],
    summary: "주문 상세 내역 조회",
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: OrderDetailSchema } },
        },
        404: { description: "주문을 찾을 수 없음" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/orders",
    tags: ["Orders"],
    summary: "주문서 생성 (결제 전 데이터 저장)",
    request: { body: { content: { "application/json": { schema: createOrderBodySchema } } } },
    responses: {
        201: {
            description: "주문 생성 성공",
            content: {
                "application/json": {
                    schema: z.object({ orderId: z.number(), amount: z.number() }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/orders/confirm",
    tags: ["Orders"],
    summary: "토스 결제 승인 확인",
    request: { body: { content: { "application/json": { schema: confirmOrderBodySchema } } } },
    responses: { 200: { description: "결제 완료 및 재고 차감 성공" } },
});

registry.registerPath({
    method: "post",
    path: "/api/orders/{id}/cancel",
    tags: ["Orders"],
    summary: "주문 취소 요청",
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: cancelOrderBodySchema } } },
    },
    responses: {
        200: { description: "취소 성공" },
        400: { description: "취소 불가 상태 (이미 배송 중 등)" },
    },
});
