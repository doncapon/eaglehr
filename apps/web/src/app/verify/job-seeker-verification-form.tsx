"use client";

import { Button, Input, Label } from "@eaglehr/ui";
import { useActionState } from "react";
import { VerificationStatusBadge } from "@/components/verification-status-badge";
import { submitJobSeekerVerificationAction } from "@/lib/verification-actions";

interface JobSeekerVerificationFormProps {
  verificationStatus: string;
  verificationNote: string | null;
  nin: string | null;
  hasDocument: boolean;
}

export function JobSeekerVerificationForm({
  verificationStatus,
  verificationNote,
  nin,
  hasDocument,
}: JobSeekerVerificationFormProps) {
  const [state, formAction, isPending] = useActionState(submitJobSeekerVerificationAction, undefined);
  // Locked while a submission is awaiting review or already approved — only a
  // rejection reopens the form so a corrected NIN/document can be resubmitted.
  const isLocked = verificationStatus === "PENDING" || verificationStatus === "APPROVED";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Identity verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify your NIN so employers can trust your profile.
          </p>
        </div>
        <VerificationStatusBadge status={verificationStatus} />
      </div>

      {verificationStatus === "REJECTED" && verificationNote ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {verificationNote}
        </p>
      ) : null}

      {hasDocument ? (
        <a
          href="/api/verification/job-seeker-document"
          target="_blank"
          rel="noreferrer"
          className="w-fit text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          View uploaded document
        </a>
      ) : null}

      {isLocked ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {verificationStatus === "APPROVED"
            ? "You're verified — no further action needed."
            : "Your submission is awaiting review. You'll be able to resubmit if it's rejected."}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nin">National Identification Number (NIN)</Label>
          <Input
            id="nin"
            name="nin"
            defaultValue={nin ?? ""}
            placeholder="12345678901"
            maxLength={11}
            required
            disabled={isLocked}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="file">NIN slip or ID card (PDF, JPG, or PNG)</Label>
          <input
            id="file"
            type="file"
            name="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            required
            disabled={isLocked}
            className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300"
          />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
        <Button type="submit" disabled={isPending || isLocked} className="w-fit">
          {isPending
            ? "Submitting..."
            : verificationStatus === "APPROVED"
              ? "Verified"
              : verificationStatus === "PENDING"
                ? "Pending review"
                : "Submit for verification"}
        </Button>
      </form>
    </div>
  );
}
