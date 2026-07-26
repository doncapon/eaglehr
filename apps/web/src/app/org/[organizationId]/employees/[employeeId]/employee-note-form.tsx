"use client";

import { Button, Textarea } from "@eaglehr/ui";
import { useActionState } from "react";
import { addEmployeeNoteAction } from "@/lib/employee-actions";

export function EmployeeNoteForm({ organizationId, employeeId }: { organizationId: string; employeeId: string }) {
  const [state, formAction, isPending] = useActionState(
    addEmployeeNoteAction.bind(null, organizationId, employeeId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Textarea name="body" placeholder="Add a note..." rows={2} required />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending} className="w-fit">
          {isPending ? "Adding..." : "Add note"}
        </Button>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </div>
    </form>
  );
}
