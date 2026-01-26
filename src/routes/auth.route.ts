import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { registerBodySchema, loginBodySchema } from "../schemas/auth.schema";

const authRoute = Router();
const authController = new AuthController();

authRoute.post("/register", validateBody(registerBodySchema), authController.register);

authRoute.post("/login", validateBody(loginBodySchema), authController.login);

export default authRoute;
