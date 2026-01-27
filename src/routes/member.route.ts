import { Router } from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { updateProfileBodySchema, changePasswordBodySchema } from "../schemas/member.schema";

const memberRouter = Router();
const memberController = new MemberController();

memberRouter.use(authenticateJwt);

memberRouter.get("/me", memberController.getMe);
memberRouter.put("/me", validateBody(updateProfileBodySchema), memberController.updateMe);
memberRouter.patch(
    "/me/password",
    validateBody(changePasswordBodySchema),
    memberController.updatePassword,
);

export default memberRouter;
