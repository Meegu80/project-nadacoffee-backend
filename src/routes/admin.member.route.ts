import { Router } from "express";
import { AdminMemberController } from "../controllers/admin.member.controller";
import { isAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();
const adminMemberController = new AdminMemberController();

router.use(authenticateJwt, isAdmin);

router.get("/members", adminMemberController.getMembers);
router.get("/members/:id", adminMemberController.getMember);
router.post("/members", adminMemberController.createMember);
router.put("/members/:id", adminMemberController.updateMember);
router.delete("/members/:id", adminMemberController.deleteMember);

export default router;
