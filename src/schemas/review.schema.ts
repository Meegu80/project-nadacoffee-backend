import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Reviews";

// 1. 리뷰 작성 (POST)
export const createReviewBodySchema = z
    .object({
        orderId: z.number().int().positive().openapi({ example: 1, description: "주문 ID" }),
        prodId: z.number().int().positive().openapi({ example: 5, description: "상품 ID" }),
        rating: z.number().int().min(1).max(5).openapi({ example: 5, description: "별점 (1~5)" }),
        content: z
            .string()
            .min(10, "리뷰는 10자 이상 작성해주세요.")
            .openapi({ example: "상품이 너무 좋아요!", description: "내용" }),
        // 변경: 단일 문자열 -> 문자열 배열
        imageUrls: z
            .array(z.string())
            .optional()
            .openapi({
                example: ["https://bucket/img1.jpg", "https://bucket/img2.jpg"],
                description: "이미지 URL 목록",
            }),
    })
    .openapi("CreateReviewBody");

// 2. 리뷰 수정 (PATCH)
export const updateReviewBodySchema = z
    .object({
        rating: z.number().int().min(1).max(5).optional(),
        content: z.string().min(10, "리뷰는 10자 이상 작성해주세요.").optional(),
        // 변경: 이미지 목록을 통째로 교체할 때 사용
        imageUrls: z.array(z.string()).optional(),
    })
    .openapi("UpdateReviewBody");

// 3. 리뷰 응답 구조
const ReviewItemSchema = z.object({
    id: z.number(),
    rating: z.number(),
    content: z.string(),
    // 변경: 이미지 객체 배열 반환
    reviewImages: z.array(
        z.object({
            id: z.number(),
            url: z.string(),
        }),
    ),
    createdAt: z.date(),
    updatedAt: z.date(),
    member: z.object({
        name: z.string(),
    }),
    product: z
        .object({
            id: z.number(),
            name: z.string(),
            imageUrl: z.string().nullable(),
        })
        .optional(),
});

const PaginatedReviewResponseSchema = createPaginatedResponseSchema(ReviewItemSchema);

// --- API 등록 ---

registry.registerPath({
    method: "post",
    path: "/api/reviews",
    tags: [OPEN_API_TAG],
    summary: "리뷰 등록",
    request: { body: { content: { "application/json": { schema: createReviewBodySchema } } } },
    responses: { 201: { description: "성공" } },
});

registry.registerPath({
    method: "patch",
    path: "/api/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "리뷰 수정",
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: updateReviewBodySchema } } },
    },
    responses: { 200: { description: "수정 성공" } },
});

registry.registerPath({
    method: "get",
    path: "/api/reviews/me",
    tags: [OPEN_API_TAG],
    summary: "내 리뷰 목록 조회 (마이페이지)",
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PaginatedReviewResponseSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/reviews/product/{prodId}",
    tags: [OPEN_API_TAG],
    summary: "상품별 리뷰 목록 조회 (상품 상세)",
    request: {
        params: z.object({ prodId: z.string() }),
        query: PaginationQuerySchema,
    },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: PaginatedReviewResponseSchema } },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "리뷰 삭제",
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { description: "삭제 성공" } },
});
