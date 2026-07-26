"use client";

import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@eaglehr/types";
import { Button, Input, Select, Textarea } from "@eaglehr/ui";
import { useActionState } from "react";
import { createMyLeaveRequestAction } from "@/lib/leave-actions";

export function LeaveRequestForm({ employeeId }: { employeeId: string }) {
  const [state, formAction, isPending] = useActionState(createMyLeaveRequestAction.bind(null, employeeId), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select name="type" defaultValue="ANNUAL" className="sm:w-40">
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {LEAVE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Input type="date" name="startDate" required className="sm:w-40" />
        <Input type="date" name="endDate" required className="sm:w-40" />
      </div>
      <Textarea name="reason" placeholder="Reason (optional)" rows={2} />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending} className="w-fit">
          {isPending ? "Submitting..." : "Request leave"}
        </Button>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
      </div>
    </form>
  );
}
