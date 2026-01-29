import express from "express";
import cors from "cors";
import passport from "passport";
import { jwtStrategy } from "./config/passport";
import authRoute from "./routes/auth.route";
import adminMemberRoute from "./routes/admin.member.route";
import { validateClientKey } from "./middlewares/clientAuth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import categoryRoute from "./routes/category.route";
import adminCategoryRoute from "./routes/admin.category.route";
import { generateOpenApiDocs } from "./config/openApi";
import { apiReference } from "@scalar/express-api-reference";
import "./schemas/admin.category.schema";
import "./schemas/admin.member.schema";
import "./schemas/auth.schema";
import "./schemas/category.schema";
import memberRoute from "./routes/member.route";
import uploadRoute from "./routes/upload.route";
import productRoute from "./routes/product.route";
import adminProductRoute from "./routes/admin.product.route";

const app = express();
const PORT = process.env.PORT || 4101;
const API_DOCS_ROUTE = process.env.API_DOCS_ROUTE || "/api-docs";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
passport.use(jwtStrategy);

const openApiDocument = generateOpenApiDocs();

app.use(
    "/api-docs",
    apiReference({
        spec: { content: openApiDocument },
        theme: "purple",
    }),
);

app.use(validateClientKey);

app.use("/api/uploads", uploadRoute);
app.use("/api/auth", authRoute);
app.use("/api/members", memberRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/admin", adminMemberRoute);
app.use("/api/admin/categories", adminCategoryRoute);
app.use("/api/admin/products", adminProductRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    console.log(`📄 Scalar Docs available at http://localhost:${PORT}/${API_DOCS_ROUTE}`);
});
