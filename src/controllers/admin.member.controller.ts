import { Request, Response, NextFunction } from 'express';
import { AdminMemberService } from "../services/admin.user.service";

const adminMemberService = new AdminMemberService();

export class AdminMemberController {
    async getMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await adminMemberService.getMembers(page, limit);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const user = await adminMemberService.getMemberById(userId);
            res.status(200).json({ data: user });
        } catch (error) {
            next(error);
        }
    }

    async createMember(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await adminMemberService.createMember(req.body);
            res.status(201).json({ message: '회원 생성 성공', data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const user = await adminMemberService.updateMember(userId, req.body);
            res.status(200).json({ message: '회원 정보 수정 성공', data: user });
        } catch (error) {
            next(error);
        }
    }

    async deleteMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const result = await adminMemberService.deleteMember(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}