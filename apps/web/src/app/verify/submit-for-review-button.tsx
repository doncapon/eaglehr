"use client";

import { Button } from "@eaglehr/ui";
import { useActionState } from "react";
import { submitOrganizationForVerificationAction } from "@/lib/verification-actions";

interface SubmitForReviewButtonProps {
  organizationId: string;
  verificationStatus: string;
}

export function SubmitForReviewButton({ organizationId, verificationStatus }: SubmitForReviewButtonProps) {
  const [state, formAction, isPending] = useActionState(
    submitOrganizationForVerificationAction.bind(null, organizationId),
    undefined,
  );
  // Locked while awaiting review or already approved — only a rejection reopens
  // this so updated documents can be resubmitted.
  const isLocked = verificationStatus === "PENDING" || verificationStatus === "APPROVED";

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <Button type="submit" disabled={isPending || isLocked} className="w-fit">
        {isPending
          ? "Submitting..."
          : verificationStatus === "APPROVED"
            ? "Verified"
            : verificationStatus === "PENDING"
              ? "Pending review"
              : "Submit for review"}
      </Button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
    </form>
  );
}
