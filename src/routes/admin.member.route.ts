import { Router } from "express";
import { AdminMemberController } from "../controllers/admin.member.controller";
import { isAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
    createMemberBodySchema,
    memberIdParamSchema,
    memberListQuerySchema,
    updateMemberBodySchema,
} from "../schemas/admin.member.schema";

const router = Router();
const adminMemberController = new AdminMemberController();

router.use(authenticateJwt, isAdmin);

router.get("/members", validateQuery(memberListQuerySchema), adminMemberController.getMembers);
router.get("/members/:id", validateParams(memberIdParamSchema), adminMemberController.getMember);
router.post("/members", validateBody(createMemberBodySchema), adminMemberController.createMember);
router.put(
    "/members/:id",
    validateParams(memberIdParamSchema),
    validateBody(updateMemberBodySchema),
    adminMemberController.updateMember,
);
router.delete(
    "/members/:id",
    validateParams(memberIdParamSchema),
    adminMemberController.deleteMember,
);

export default router;
