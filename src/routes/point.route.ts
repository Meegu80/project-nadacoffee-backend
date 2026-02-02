import { Router } from "express";
import { PointController } from "../controllers/point.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateQuery } from "../middlewares/validation.middleware";
import { PaginationQuerySchema } from "../schemas/common.schema";
import "../schemas/point.schema";

const pointRouter = Router();
const pointController = new PointController();

pointRouter.use(authenticateJwt);

pointRouter.get("/balance", pointController.getPointBalance);
pointRouter.get("/", validateQuery(PaginationQuerySchema), pointController.getPointLogs);

export default pointRouter;
