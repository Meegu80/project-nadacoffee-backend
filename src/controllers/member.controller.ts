import { Request, Response, NextFunction } from "express";
import { MemberService } from "../services/member.service";
import { Member } from "@prisma/client";

const memberService = new MemberService();

export class MemberController {
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as Member;
            const result = await memberService.getMyProfile(user.id);

            res.status(200).json({
                message: "내 정보 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as Member;
            const result = await memberService.updateProfile(user.id, req.body);

            res.status(200).json({
                message: "회원 정보 수정 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as Member;
            const result = await memberService.updatePassword(user.id, req.body);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
