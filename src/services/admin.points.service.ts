import { HttpException } from "../utils/exception.utils";
import { prisma } from "../config/prisma";

export class AdminPointsService {
    async givePoint(data: { memberId: number; amount: number; reason: string }) {
        const { memberId, amount, reason } = data;

        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) {
            throw new HttpException(404, "존재하지 않는 회원입니다.");
        }

        return await prisma.pointLog.create({
            data: {
                memberId,
                amount,
                reason,
            },
        });
    }

    async giveBulkPoint(data: { amount: number; reason: string }) {
        const { amount, reason } = data;

        const members = await prisma.member.findMany({
            where: { status: "ACTIVE" }, // 활성 회원에게만 지급
            select: { id: true },
        });

        if (members.length === 0) {
            throw new HttpException(400, "지급 대상 회원이 없습니다.");
        }

        const pointData = members.map(member => ({
            memberId: member.id,
            amount,
            reason,
        }));

        const result = await prisma.pointLog.createMany({
            data: pointData,
        });

        return { count: result.count, message: `${result.count}명에게 포인트 지급 완료` };
    }
}
