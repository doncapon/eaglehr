import { SetMetadata } from "@nestjs/common";
import type { OrgRole } from "@eaglehr/types";

export const ROLES_KEY = "orgRoles";
export const Roles = (...roles: OrgRole[]) => SetMetadata(ROLES_KEY, roles);
