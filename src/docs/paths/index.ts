import { authPaths } from "./auth.paths";
import { adminMemberPaths } from "./admin.member.paths";
import { categoryPaths } from "./category.paths";
import { adminCategoryPaths } from "./admin.category.paths";

export const paths = {
    ...authPaths,
    ...adminMemberPaths,
    ...adminCategoryPaths,
    ...categoryPaths,
};
