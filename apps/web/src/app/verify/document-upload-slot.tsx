"use client";

import { Button } from "@eaglehr/ui";
import { CheckCircle2, Upload } from "lucide-react";
import { useActionState } from "react";
import { uploadOrganizationDocumentAction } from "@/lib/verification-actions";

interface DocumentUploadSlotProps {
  organizationId: string;
  type: string;
  label: string;
  uploaded: boolean;
  viewHref: string | null;
  disabled?: boolean;
}

export function DocumentUploadSlot({ organizationId, type, label, uploaded, viewHref, disabled }: DocumentUploadSlotProps) {
  const [state, formAction, isPending] = useActionState(
    uploadOrganizationDocumentAction.bind(null, organizationId, type),
    undefined,
  );

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {uploaded ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Uploaded
          </span>
        ) : null}
      </div>
      {uploaded && viewHref ? (
        <a
          href={viewHref}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-xs text-brand-600 hover:underline dark:text-brand-400"
        >
          View current file
        </a>
      ) : null}
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          required
          disabled={disabled}
          className="text-xs text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-brand-600 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300"
        />
        <Button type="submit" size="sm" variant="outline" disabled={isPending || disabled} className="gap-1">
          <Upload className="h-3 w-3" aria-hidden />
          {isPending ? "Uploading..." : uploaded ? "Replace" : "Upload"}
        </Button>
      </form>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </div>
  );
}
