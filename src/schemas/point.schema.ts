import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

export const PointLogSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        amount: z.number().openapi({ example: 5000, description: "적립(+) 또는 사용(-)" }),
        reason: z.string().openapi({ example: "상품 구매 포인트 사용" }),
        createdAt: z.date(),
        orderId: z.number().nullable().openapi({ example: 123, description: "관련된 주문 ID" }),
    })
    .openapi("PointLog");

const PaginatedPointLogSchema = createPaginatedResponseSchema(PointLogSchema);

export const PointBalanceSchema = z
    .object({
        balance: z.number().openapi({ example: 5000, description: "현재 사용 가능한 총 포인트" }),
    })
    .openapi("PointBalance");

registry.registerPath({
    method: "get",
    path: "/api/points/balance",
    tags: ["Points"],
    summary: "내 포인트 잔액 조회",
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PointBalanceSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/points",
    tags: ["Points"],
    summary: "내 포인트 내역 조회 (페이징)",
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PaginatedPointLogSchema } },
        },
    },
});
