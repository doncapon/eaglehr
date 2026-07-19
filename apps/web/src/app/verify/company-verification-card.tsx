import { ORGANIZATION_DOCUMENT_TYPES, ORGANIZATION_DOCUMENT_TYPE_LABELS } from "@eaglehr/types";
import { VerificationStatusBadge } from "@/components/verification-status-badge";
import { DocumentUploadSlot } from "./document-upload-slot";
import { RcNumberField } from "./rc-number-field";
import { SubmitForReviewButton } from "./submit-for-review-button";

interface CompanyVerificationCardProps {
  organization: {
    id: string;
    name: string;
    rcNumber: string | null;
    verificationStatus: string;
    verificationNote: string | null;
    verificationDocuments: { type: string }[];
  };
}

export function CompanyVerificationCard({ organization }: CompanyVerificationCardProps) {
  const uploadedTypes = new Set(organization.verificationDocuments.map((document) => document.type));
  // Locked while awaiting review or already approved — only a rejection reopens
  // the RC number and document uploads so a corrected submission can be made.
  const isLocked = organization.verificationStatus === "PENDING" || organization.verificationStatus === "APPROVED";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{organization.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify your company to build trust with candidates.
          </p>
        </div>
        <VerificationStatusBadge status={organization.verificationStatus} />
      </div>

      {organization.verificationStatus === "REJECTED" && organization.verificationNote ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {organization.verificationNote}
        </p>
      ) : null}

      <RcNumberField organizationId={organization.id} rcNumber={organization.rcNumber} disabled={isLocked} />

      <div className="grid gap-3 sm:grid-cols-3">
        {ORGANIZATION_DOCUMENT_TYPES.map((type) => (
          <DocumentUploadSlot
            key={type}
            organizationId={organization.id}
            type={type}
            label={ORGANIZATION_DOCUMENT_TYPE_LABELS[type]}
            uploaded={uploadedTypes.has(type)}
            viewHref={uploadedTypes.has(type) ? `/api/verification/org-document/${organization.id}/${type}` : null}
            disabled={isLocked}
          />
        ))}
      </div>

      <SubmitForReviewButton organizationId={organization.id} verificationStatus={organization.verificationStatus} />
    </div>
  );
}
