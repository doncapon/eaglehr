import { Badge } from "@eaglehr/ui";

const VARIANTS = {
  OWNER: "default",
  ADMIN: "warning",
  RECRUITER: "secondary",
} as const;

export function OrgRoleBadge({ role }: { role: string }) {
  const variant = VARIANTS[role as keyof typeof VARIANTS] ?? "secondary";
  return <Badge variant={variant}>{role}</Badge>;
}
