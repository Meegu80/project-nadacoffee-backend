import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Reviews";

// 1. 관리자용 리뷰 목록 조회 쿼리 (필터링 포함)
export const getAdminReviewQuerySchema = PaginationQuerySchema.extend({
    prodId: z.coerce.number().optional().openapi({ description: "상품 ID 필터" }),
    memberId: z.coerce.number().optional().openapi({ description: "회원 ID 필터" }),
    search: z.string().optional().openapi({ description: "리뷰 내용 검색어" }),
});

// 2. 리뷰 상세 응답 스키마
const AdminReviewItemSchema = z.object({
    id: z.number(),
    rating: z.number(),
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    // 관리자에게는 주문 번호, 회원 정보, 상품 정보, 이미지 모두 제공
    orderId: z.number(),
    member: z.object({
        id: z.number(),
        email: z.string(),
        name: z.string(),
    }),
    product: z.object({
        id: z.number(),
        name: z.string(),
        imageUrl: z.string().nullable(),
    }),
    reviewImages: z.array(
        z.object({
            id: z.number(),
            url: z.string(),
        }),
    ),
});

const PaginatedAdminReviewResponseSchema = createPaginatedResponseSchema(AdminReviewItemSchema);

// --- API 등록 ---

registry.registerPath({
    method: "get",
    path: "/api/admin/reviews",
    tags: [OPEN_API_TAG],
    summary: "[관리자] 전체 리뷰 목록 조회 (검색/필터)",
    request: { query: getAdminReviewQuerySchema },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PaginatedAdminReviewResponseSchema } },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "[관리자] 부적절한 리뷰 강제 삭제",
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { description: "삭제 성공" } },
});
