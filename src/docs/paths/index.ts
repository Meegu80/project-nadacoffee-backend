import { authPaths } from "./auth.paths";
import { adminMemberPaths } from "./admin.member.paths";

export const paths = {
    ...authPaths,
    ...adminMemberPaths,
};
