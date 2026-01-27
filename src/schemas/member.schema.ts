import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { MemberGrade, MemberStatus, Role } from "@prisma/client";

extendZodWithOpenApi(z);

export const MyProfileResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        email: z.email().openapi({ example: "user@example.com" }),
        name: z.string().openapi({ example: "홍길동" }),
        phone: z.string().openapi({ example: "010-1234-5678" }),
        grade: z.enum(MemberGrade),
        status: z.enum(MemberStatus),
        role: z.enum(Role),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .openapi("MyProfileResponse");

export const updateProfileBodySchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요.").optional().openapi({ example: "변경된이름" }),
    phone: z
        .string()
        .min(1, "전화번호를 입력해주세요.")
        .optional()
        .openapi({ example: "010-9999-8888" }),
});

export const changePasswordBodySchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "현재 비밀번호를 입력해주세요.")
            .openapi({ example: "oldPassword123!" }),
        newPassword: z
            .string()
            .min(6, "새 비밀번호는 6자 이상이어야 합니다.")
            .openapi({ example: "newPassword123!" }),
        confirmPassword: z.string().openapi({ example: "newPassword123!" }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: "새 비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
    });

export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;

registry.registerPath({
    method: "get",
    path: "/api/members/me",
    tags: ["Member (User)"],
    summary: "내 정보 조회",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: MyProfileResponseSchema,
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "put",
    path: "/api/members/me",
    tags: ["Member (User)"],
    summary: "내 정보 수정 (이름, 전화번호)",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: updateProfileBodySchema },
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
                        data: MyProfileResponseSchema,
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/members/me/password",
    tags: ["Member (User)"],
    summary: "비밀번호 변경",
    description: "현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: changePasswordBodySchema },
            },
        },
    },
    responses: {
        200: {
            description: "변경 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string() }),
                },
            },
        },
        401: { description: "현재 비밀번호 불일치" },
    },
});
