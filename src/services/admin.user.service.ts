import bcrypt from "bcryptjs";
import { MemberGrade, MemberStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

interface CreateMemberDto {
    name: string;
    email: string;
    password: string;
    phone: string;
    grade: MemberGrade;
    status: MemberStatus;
    role?: Role;
}

interface UpdateMemberDto {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    grade?: MemberGrade;
    status?: MemberStatus;
    role?: Role;
}

export class AdminMemberService {
    async getMembers(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, users] = await prisma.$transaction([
            prisma.member.count(),
            prisma.member.findMany({
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return {
            data: sanitizedUsers,
            pagination: {
                totalMembers: total,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        };
    }

    async getMemberById(userId: number) {
        const user = await prisma.member.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async createMember(data: CreateMemberDto) {
        const existingUser = await prisma.member.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new HttpException(409, "이미 존재하는 이메일입니다.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.member.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                phone: data.phone,
                grade: data.grade,
                status: data.status,
                role: data.role || Role.USER,
            },
        });

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async updateMember(userId: number, data: UpdateMemberDto) {
        const user = await prisma.member.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.member.update({
            where: { id: userId },
            data: { ...data },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async deleteMember(userId: number) {
        const user = await prisma.member.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        await prisma.member.delete({
            where: { id: userId },
        });

        return { message: "회원이 삭제되었습니다.", deletedId: userId };
    }
}
