import { prisma } from "../config/prisma";

export class PointService {
    async getMyPointBalance(memberId: number) {
        const aggregate = await prisma.pointLog.aggregate({
            where: { memberId },
            _sum: { amount: true },
        });

        return {
            balance: aggregate._sum.amount || 0,
        };
    }

    async getMyPointLogs(memberId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, logs] = await Promise.all([
            prisma.pointLog.count({ where: { memberId } }),
            prisma.pointLog.findMany({
                where: { memberId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        const aggregate = await prisma.pointLog.aggregate({
            where: { memberId },
            _sum: { amount: true },
        });

        return {
            balance: aggregate._sum.amount || 0,
            data: logs,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }
}
