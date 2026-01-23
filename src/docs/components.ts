export const components = {
    securitySchemes: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        },
    },
    schemas: {
        Role: {
            type: "string",
            enum: ["USER", "ADMIN"],
            example: "USER",
        },
        MemberGrade: {
            type: "string",
            enum: ["SILVER", "GOLD", "VIP"],
            example: "SILVER",
        },
        MemberStatus: {
            type: "string",
            enum: ["ACTIVE", "DORMANT", "WITHDRAWN"],
            example: "ACTIVE",
        },
        RegisterFormInput: {
            type: "object",
            required: ["name", "email", "password", "password_confirm", "phone"],
            properties: {
                name: { type: "string", example: "홍길동" },
                email: { type: "string", format: "email", example: "user@example.com" },
                password: { type: "string", format: "password", example: "password123!" },
                password_confirm: {
                    type: "string",
                    format: "password",
                    description: "비밀번호 확인",
                    example: "password123!",
                },
                phone: { type: "string", example: "010-1234-5678" },
            },
        },
        LoginFormInput: {
            type: "object",
            required: ["email", "password"],
            properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                password: { type: "string", format: "password", example: "password123!" },
            },
        },
        CreateMemberInput: {
            type: "object",
            required: ["name", "email", "password", "phone", "grade", "status"],
            properties: {
                name: { type: "string", example: "관리자생성회원" },
                email: { type: "string", format: "email", example: "admin_created@example.com" },
                password: { type: "string", format: "password", example: "password123!" },
                phone: { type: "string", example: "010-9999-8888" },
                grade: { $ref: "#/components/schemas/MemberGrade" },
                status: { $ref: "#/components/schemas/MemberStatus" },
                role: { $ref: "#/components/schemas/Role" },
            },
        },
        UpdateMemberInput: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string", format: "password" },
                phone: { type: "string" },
                grade: { $ref: "#/components/schemas/MemberGrade" },
                status: { $ref: "#/components/schemas/MemberStatus" },
                role: { $ref: "#/components/schemas/Role" },
            },
        },

        UserResponse: {
            type: "object",
            properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "홍길동" },
                email: { type: "string", example: "user@example.com" },
                phone: { type: "string", example: "010-1234-5678" },
                grade: { $ref: "#/components/schemas/MemberGrade" },
                status: { $ref: "#/components/schemas/MemberStatus" },
                role: { $ref: "#/components/schemas/Role" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
            },
        },
        Category: {
            type: "object",
            properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Coffee Beans" },
                parentId: { type: "integer", nullable: true, example: null },
                depth: { type: "integer", example: 1 },
                sortOrder: { type: "integer", example: 1 },
                categories: {
                    type: "array",
                    items: {
                        $ref: "#/components/schemas/Category",
                    },
                },
            },
        },
        CategoryTreeResponse: {
            type: "object",
            properties: {
                message: { type: "string", example: "카테고리 목록 조회 성공" },
                data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Category" },
                },
            },
        },
        CategoryDetailResponse: {
            type: "object",
            properties: {
                message: { type: "string", example: "카테고리 상세 조회 성공" },
                data: { $ref: "#/components/schemas/Category" },
            },
        },
        CreateCategoryInput: {
            type: "object",
            required: ["name"],
            properties: {
                name: { type: "string", example: "에티오피아 원두", description: "카테고리 이름" },
                parentId: {
                    type: "integer",
                    nullable: true,
                    example: 1,
                    description: "상위 카테고리 ID (없으면 null)",
                },
                sortOrder: { type: "integer", example: 1, description: "정렬 순서" },
            },
        },
        UpdateCategoryInput: {
            type: "object",
            properties: {
                name: { type: "string", example: "수정된 카테고리명" },
                parentId: { type: "integer", nullable: true, example: null },
                sortOrder: { type: "integer", example: 2 },
            },
        },
    },
};
