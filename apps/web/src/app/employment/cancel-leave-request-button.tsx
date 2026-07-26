"use client";

import { Button } from "@eaglehr/ui";
import { useActionState } from "react";
import { cancelMyLeaveRequestAction } from "@/lib/leave-actions";

export function CancelLeaveRequestButton({ employeeId, leaveRequestId }: { employeeId: string; leaveRequestId: string }) {
  const [state, formAction, isPending] = useActionState(
    cancelMyLeaveRequestAction.bind(null, employeeId, leaveRequestId),
    undefined,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Cancelling..." : "Cancel request"}
      </Button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
