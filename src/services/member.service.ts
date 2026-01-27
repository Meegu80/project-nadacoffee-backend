import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { ChangePasswordInput, UpdateProfileInput } from "../schemas/member.schema";

export class MemberService {
    async getMyProfile(userId: number) {
        const user = await prisma.member.findUnique({
            where: { id: userId },
        });

        if (!user) throw new HttpException(404, "사용자 정보를 찾을 수 없습니다.");

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateProfile(userId: number, data: UpdateProfileInput) {
        const user = await prisma.member.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone,
            },
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updatePassword(userId: number, data: ChangePasswordInput) {
        const user = await prisma.member.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "사용자 정보를 찾을 수 없습니다.");

        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
            throw new HttpException(401, "현재 비밀번호가 일치하지 않습니다.");
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        await prisma.member.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: "비밀번호가 성공적으로 변경되었습니다." };
    }
}
