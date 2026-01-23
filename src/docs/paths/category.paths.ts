export const categoryPaths = {
    "/api/categories": {
        get: {
            summary: "전체 카테고리 목록 조회 (계층형)",
            description: "메뉴 구성을 위한 카테고리 전체 트리를 반환합니다.",
            tags: ["Categories"],
            responses: {
                "200": {
                    description: "조회 성공",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CategoryTreeResponse",
                            },
                        },
                    },
                },
                "500": {
                    description: "서버 오류",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "서버 내부 오류가 발생했습니다.",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/categories/{id}": {
        get: {
            summary: "특정 카테고리 상세 조회",
            tags: ["Categories"],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "integer" },
                    description: "카테고리 ID",
                },
            ],
            responses: {
                "200": {
                    description: "조회 성공",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CategoryDetailResponse",
                            },
                        },
                    },
                },
                "404": {
                    description: "카테고리 없음",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "존재하지 않는 카테고리입니다.",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
