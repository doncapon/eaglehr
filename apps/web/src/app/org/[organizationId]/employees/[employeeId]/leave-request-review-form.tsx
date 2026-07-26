"use client";

import { Button, Textarea } from "@eaglehr/ui";
import { useActionState } from "react";
import { reviewLeaveRequestAction } from "@/lib/employee-actions";

export function LeaveRequestReviewForm({
  organizationId,
  employeeId,
  leaveRequestId,
}: {
  organizationId: string;
  employeeId: string;
  leaveRequestId: string;
}) {
  const [approveState, approveAction, approvePending] = useActionState(
    reviewLeaveRequestAction.bind(null, organizationId, employeeId, leaveRequestId, "APPROVED"),
    undefined,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    reviewLeaveRequestAction.bind(null, organizationId, employeeId, leaveRequestId, "REJECTED"),
    undefined,
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <form action={approveAction}>
        <Button type="submit" size="sm" disabled={approvePending || rejectPending}>
          {approvePending ? "Approving..." : "Approve"}
        </Button>
      </form>
      <form action={rejectAction} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start">
        <Textarea name="reviewNote" placeholder="Reason for rejection (optional)" rows={1} className="flex-1" />
        <Button type="submit" size="sm" variant="outline" disabled={approvePending || rejectPending}>
          {rejectPending ? "Rejecting..." : "Reject"}
        </Button>
      </form>
      {approveState?.error ? <p className="text-sm text-red-600">{approveState.error}</p> : null}
      {rejectState?.error ? <p className="text-sm text-red-600">{rejectState.error}</p> : null}
    </div>
  );
}
