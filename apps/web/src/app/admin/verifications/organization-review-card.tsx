"use client";

import { ORGANIZATION_DOCUMENT_TYPE_LABELS } from "@eaglehr/types";
import { Button, Textarea } from "@eaglehr/ui";
import { useActionState, useState } from "react";
import { reviewOrganizationVerificationAction } from "@/lib/admin-verification-actions";

interface OrganizationReviewCardProps {
  organization: {
    id: string;
    name: string;
    rcNumber: string | null;
    verificationDocuments: { type: string }[];
  };
}

export function OrganizationReviewCard({ organization }: OrganizationReviewCardProps) {
  const [showReject, setShowReject] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(
    reviewOrganizationVerificationAction.bind(null, organization.id, "APPROVED"),
    undefined,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    reviewOrganizationVerificationAction.bind(null, organization.id, "REJECTED"),
    undefined,
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div>
        <p className="font-medium">{organization.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">RC number: {organization.rcNumber ?? "—"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {organization.verificationDocuments.map((document) => (
          <a
            key={document.type}
            href={`/api/verification/admin/org-document/${organization.id}/${document.type}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            View {ORGANIZATION_DOCUMENT_TYPE_LABELS[document.type as keyof typeof ORGANIZATION_DOCUMENT_TYPE_LABELS]}
          </a>
        ))}
      </div>

      {showReject ? (
        <form action={rejectAction} className="flex flex-col gap-2">
          <Textarea name="note" placeholder="Reason for rejection (shown to the employer)" required rows={2} />
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
