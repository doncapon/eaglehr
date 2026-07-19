"use client";

import { Button, Textarea } from "@eaglehr/ui";
import { useActionState, useState } from "react";
import { reviewJobSeekerVerificationAction } from "@/lib/admin-verification-actions";

interface JobSeekerReviewCardProps {
  profile: {
    id: string;
    nin: string | null;
    user: { firstName: string; lastName: string; email: string };
  };
}

export function JobSeekerReviewCard({ profile }: JobSeekerReviewCardProps) {
  const [showReject, setShowReject] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(
    reviewJobSeekerVerificationAction.bind(null, profile.id, "APPROVED"),
    undefined,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    reviewJobSeekerVerificationAction.bind(null, profile.id, "REJECTED"),
    undefined,
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {profile.user.firstName} {profile.user.lastName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.user.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">NIN: {profile.nin ?? "—"}</p>
        </div>
        <a
          href={`/api/verification/admin/job-seeker-document/${profile.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          View document
        </a>
      </div>

      {showReject ? (
        <form action={rejectAction} className="flex flex-col gap-2">
          <Textarea name="note" placeholder="Reason for rejection (shown to the applicant)" required rows={2} />
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={rejectPending}>
              {rejectPending ? "Rejecting..." : "Confirm reject"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowReject(false)}>
              Cancel
            </Button>
          </div>
          {rejectState?.error ? <p className="text-sm text-red-600">{rejectState.error}</p> : null}
        </form>
      ) : (
        <div className="flex gap-2">
          <form action={approveAction}>
            <Button type="submit" size="sm" disabled={approvePending}>
              {approvePending ? "Approving..." : "Approve"}
            </Button>
          </form>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowReject(true)}>
            Reject
          </Button>
        </div>
      )}
      {approveState?.error ? <p className="text-sm text-red-600">{approveState.error}</p> : null}
      {approveState?.success ?? rejectState?.success ? (
        <p className="text-sm text-green-600">{approveState?.success ?? rejectState?.success}</p>
      ) : null}
    </div>
  );
}
