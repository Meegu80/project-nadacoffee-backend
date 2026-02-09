import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

// 1. 특정 회원 포인트 지급 스키마
export const givePointBodySchema = z
    .object({
        memberId: z.number().int().positive().openapi({ example: 1, description: "대상 회원 ID" }),
        amount: z
            .number()
            .int()
            .openapi({ example: 5000, description: "지급할 포인트 (음수 가능)" }),
        reason: z.string().min(1).openapi({ example: "회원가입 축하금", description: "지급 사유" }),
    })
    .openapi("GivePointBody");

// 2. 전체 회원 포인트 일괄 지급 스키마
export const giveBulkPointBodySchema = z
    .object({
        amount: z.number().int().openapi({ example: 1000, description: "전체 지급할 포인트" }),
        reason: z
            .string()
            .min(1)
            .openapi({ example: "새해 맞이 이벤트", description: "지급 사유" }),
    })
    .openapi("GiveBulkPointBody");

// --- API 등록 ---

registry.registerPath({
    method: "post",
    path: "/api/admin/points",
    tags: ["Admin/Points"],
    summary: "[관리자] 특정 회원 포인트 지급/차감",
    request: {
        body: { content: { "application/json": { schema: givePointBodySchema } } },
    },
    responses: {
        201: { description: "지급 완료" },
        404: { description: "회원을 찾을 수 없음" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/points/bulk-all",
    tags: ["Admin/Points"],
    summary: "[관리자] 전체 회원 포인트 일괄 지급",
    request: {
        body: { content: { "application/json": { schema: giveBulkPointBodySchema } } },
    },
    responses: {
        201: { description: "일괄 지급 완료" },
    },
});
