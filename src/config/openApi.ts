import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

export function generateOpenApiDocs() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "NadaCoffee 쇼핑몰 API",
            version: "1.0.0",
        },
        servers: [{ url: "/api" }],
        "x-tagGroups": [
            {
                name: "공용 API",
                tags: [
                    "Auth",
                    "Members",
                    "Categories",
                    "Products",
                    "Cart",
                    "Orders",
                    "Points",
                    "Reviews",
                    "Inquiries",
                    "Uploads",
                ],
            },
            {
                name: "관리자 API",
                tags: [
                    "Admin/Members",
                    "Admin/Categories",
                    "Admin/Products",
                    "Admin/Orders",
                    "Admin/Points",
                    "Admin/Reviews",
                    "Admin/Inquiries",
                ],
            },
        ],
    });
}
