import express from "express";
import cors from "cors";
import passport from "passport";
import { jwtStrategy } from "./config/passport";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger";
import authRoute from "./routes/auth.route";
import adminMemberRoute from "./routes/admin.member.route";
import { validateClientKey } from "./middlewares/clientAuth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import categoryRouter from "./routes/category.route";
import adminCategoryRouter from "./routes/admin.category.route";

const app = express();
const PORT = process.env.PORT || 4101;
const API_DOCS_ROUTE = process.env.API_DOCS_ROUTE || "/api-docs";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
passport.use(jwtStrategy);

app.use(`/${API_DOCS_ROUTE}`, swaggerUi.serve, swaggerUi.setup(swaggerOptions));

app.use(validateClientKey);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminMemberRoute);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/categories", categoryRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs available at http://localhost:${PORT}/${API_DOCS_ROUTE}`);
});
