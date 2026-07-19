import { Badge } from "@eaglehr/ui";

const VARIANTS = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  UNVERIFIED: "secondary",
} as const;

export function VerificationStatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status as keyof typeof VARIANTS] ?? "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
