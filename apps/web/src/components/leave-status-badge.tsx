import { LEAVE_REQUEST_STATUS_LABELS, type LeaveRequestStatus } from "@eaglehr/types";
import { Badge } from "@eaglehr/ui";

const VARIANTS: Record<LeaveRequestStatus, "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

export function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  return <Badge variant={VARIANTS[status]}>{LEAVE_REQUEST_STATUS_LABELS[status]}</Badge>;
}
