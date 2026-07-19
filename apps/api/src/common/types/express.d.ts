import type { OrganizationMember } from "@eaglehr/db";
import type { OrgRole } from "@eaglehr/types";
import type { JwtPayload } from "../../auth/strategies/jwt.strategy";

declare global {
  namespace Express {
    // Extend passport's augmentable `User` interface rather than
    // re-declaring `Request.user` (which would conflict with @types/passport).
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, not a type alias
    interface User extends JwtPayload {}

    interface Request {
      orgRole?: OrgRole;
      orgMember?: OrganizationMember;
    }
  }
}
