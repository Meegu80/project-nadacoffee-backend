import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { MemberGrade, MemberStatus, Role } from "@prisma/client";

extendZodWithOpenApi(z);

const RoleEnum = z.enum(Role).openapi({ example: "USER", description: "권한 (USER, ADMIN)" });
const GradeEnum = z
    .enum(MemberGrade)
    .openapi({ example: "SILVER", description: "회원 등급" });
const StatusEnum = z
    .enum(MemberStatus)
    .openapi({ example: "ACTIVE", description: "회원 상태" });

export const MemberResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        email: z.email(),
        name: z.string(),
        phone: z.string(),
        grade: GradeEnum,
        status: StatusEnum,
        role: RoleEnum,
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .openapi("MemberResponse");

export const memberListQuerySchema = z.object({
    page: z.coerce
        .number()
        .default(1)
        .openapi({ example: 1, description: "페이지 번호 (기본값 1)" }),
    limit: z.coerce
        .number()
        .default(10)
        .openapi({ example: 10, description: "페이지당 항목 수 (기본값 10)" }),
});

export const createMemberBodySchema = z.object({
    email: z.email("이메일 형식이 올바르지 않습니다."),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
    name: z.string().min(1, "이름은 필수입니다."),
    phone: z.string().min(1, "전화번호는 필수입니다."),
    grade: GradeEnum.default(MemberGrade.SILVER),
    status: StatusEnum.default(MemberStatus.ACTIVE),
    role: RoleEnum.default(Role.USER),
});

export const updateMemberBodySchema = z.object({
    email: z.email().optional(),
    password: z.string().min(6).optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    grade: GradeEnum.optional(),
    status: StatusEnum.optional(),
    role: RoleEnum.optional(),
});

export const memberIdParamSchema = z.object({
    id: z.coerce.number().openapi({ example: 1, description: "회원 ID" }),
});

export type CreateMemberInput = z.infer<typeof createMemberBodySchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberBodySchema>;

registry.registerPath({
    method: "get",
    path: "/api/admin/members",
    tags: ["Admin Member"],
    summary: "전체 회원 목록 조회",
    security: [{ bearerAuth: [] }],
    request: {
        query: memberListQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        data: z.array(MemberResponseSchema),
                        pagination: z.object({
                            totalMembers: z.number(),
                            totalPages: z.number(),
                            currentPage: z.number(),
                            limit: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/members/{id}",
    tags: ["Admin Member"],
    summary: "회원 상세 조회",
    security: [{ bearerAuth: [] }],
    request: {
        params: memberIdParamSchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({ data: MemberResponseSchema }),
                },
            },
        },
        404: { description: "회원 없음" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/members",
    tags: ["Admin Member"],
    summary: "회원 직접 생성",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createMemberBodySchema,
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
                        data: MemberResponseSchema,
                    }),
                },
            },
        },
        409: { description: "이메일 중복" },
    },
});

registry.registerPath({
    method: "put",
    path: "/api/admin/members/{id}",
    tags: ["Admin Member"],
    summary: "회원 정보 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: memberIdParamSchema,
        body: {
            content: {
                "application/json": {
                    schema: updateMemberBodySchema,
                },
            },
        },
    },
    responses: {
        200: { description: "수정 성공" },
        404: { description: "회원 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/members/{id}",
    tags: ["Admin Member"],
    summary: "회원 삭제",
    security: [{ bearerAuth: [] }],
    request: {
        params: memberIdParamSchema,
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
