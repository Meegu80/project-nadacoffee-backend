import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { MemberGrade, MemberStatus, Role } from "@prisma/client";

extendZodWithOpenApi(z);

export const UserResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        email: z.email().openapi({ example: "user@example.com" }),
        name: z.string().openapi({ example: "홍길동" }),
        phone: z.string().openapi({ example: "010-1234-5678" }),
        grade: z.enum(MemberGrade).openapi({ example: "SILVER" }),
        status: z.enum(MemberStatus).openapi({ example: "ACTIVE" }),
        role: z.enum(Role).openapi({ example: "USER" }),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .openapi("UserResponse");

export const registerBodySchema = z
    .object({
        email: z.email("이메일 형식이 올바르지 않습니다.").openapi({ example: "user@example.com" }),
        password: z
            .string()
            .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
            .openapi({ example: "password123!" }),
        password_confirm: z.string().openapi({ example: "password123!" }),
        name: z.string().min(1, "이름은 필수입니다.").openapi({ example: "홍길동" }),
        phone: z.string().min(1, "전화번호는 필수입니다.").openapi({ example: "010-1234-5678" }),
    })
    .refine(data => data.password === data.password_confirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["password_confirm"],
    });

export const loginBodySchema = z.object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().min(1).openapi({ example: "password123!" }),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;

registry.registerPath({
    method: "post",
    path: "/api/auth/register",
    tags: ["Auth"],
    summary: "회원가입",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: registerBodySchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "회원가입 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: UserResponseSchema,
                    }),
                },
            },
        },
        400: { description: "유효성 검사 실패 (비밀번호 불일치 등)" },
        409: { description: "이미 존재하는 이메일" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/login",
    tags: ["Auth"],
    summary: "로그인",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: loginBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "로그인 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.object({
                            token: z.string().openapi({ description: "JWT Access Token" }),
                            user: UserResponseSchema,
                        }),
                    }),
                },
            },
        },
        405: { description: "이메일 또는 비밀번호 불일치" },
    },
});
