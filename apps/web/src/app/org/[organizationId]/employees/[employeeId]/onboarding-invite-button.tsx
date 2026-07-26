"use client";

import { Button } from "@eaglehr/ui";
import { useActionState } from "react";
import { sendOnboardingInviteAction } from "@/lib/employee-actions";

export function OnboardingInviteButton({
  organizationId,
  employeeId,
  label,
}: {
  organizationId: string;
  employeeId: string;
  label: string;
}) {
  const [state, formAction, isPending] = useActionState(
    sendOnboardingInviteAction.bind(null, organizationId, employeeId),
    undefined,
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Sending..." : label}
      </Button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
    </form>
  );
}
