export const adminCategoryPaths = {
    "/api/admin/categories": {
        post: {
            summary: "카테고리 생성 (관리자)",
            tags: ["Admin Categories"],
            security: [{ bearerAuth: [] }], // 관리자 토큰 필수
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/CreateCategoryInput" },
                    },
                },
            },
            responses: {
                "201": {
                    description: "생성 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "카테고리 생성 성공" },
                                    data: { $ref: "#/components/schemas/Category" },
                                },
                            },
                        },
                    },
                },
                "401": { description: "인증 실패 (토큰 없음/만료)" },
                "403": { description: "권한 없음 (관리자 아님)" },
                "404": { description: "부모 카테고리 없음 (parentId 잘못됨)" },
                "500": { description: "서버 내부 오류" },
            },
        },
    },
    "/api/admin/categories/{id}": {
        put: {
            summary: "카테고리 수정 (관리자)",
            tags: ["Admin Categories"],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UpdateCategoryInput" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "수정 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "카테고리 수정 성공" },
                                    data: { $ref: "#/components/schemas/Category" },
                                },
                            },
                        },
                    },
                },
                "401": { description: "인증 실패" },
                "403": { description: "권한 없음" },
                "404": { description: "카테고리 또는 부모 카테고리 없음" },
                "500": { description: "서버 내부 오류" },
            },
        },
        delete: {
            summary: "카테고리 삭제 (관리자)",
            description:
                "카테고리를 삭제합니다. 하위 카테고리는 상위 카테고리가 없는 상태(Root)가 됩니다.",
            tags: ["Admin Categories"],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
            responses: {
                "200": {
                    description: "삭제 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "카테고리가 삭제되었습니다.",
                                    },
                                    deletedId: { type: "integer", example: 5 },
                                },
                            },
                        },
                    },
                },
                "401": { description: "인증 실패" },
                "403": { description: "권한 없음" },
                "404": { description: "삭제할 카테고리 없음" },
                "500": { description: "서버 내부 오류" },
            },
        },
    },
};
