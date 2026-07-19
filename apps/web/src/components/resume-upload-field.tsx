"use client";

import { Button } from "@eaglehr/ui";
import { FileText, Upload } from "lucide-react";
import { useActionState } from "react";
import { uploadResumeAction } from "@/lib/resume-actions";

interface ResumeUploadFieldProps {
  currentResumeUrl: string | null;
}

function displayFilename(resumeUrl: string): string {
  const rawName = resumeUrl.split("/").pop() ?? "resume";
  const separatorIndex = rawName.indexOf("__");
  const stripped = separatorIndex >= 0 ? rawName.slice(separatorIndex + 2) : rawName;
  try {
    return decodeURIComponent(stripped);
  } catch {
    return stripped;
  }
}

export function ResumeUploadField({ currentResumeUrl }: ResumeUploadFieldProps) {
  const [state, formAction, isPending] = useActionState(uploadResumeAction, undefined);

  return (
    <div className="flex flex-col gap-2">
      {currentResumeUrl ? (
        <a
          href={currentResumeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
        >
          <FileText className="h-4 w-4 shrink-0" aria-hidden />
          {displayFilename(currentResumeUrl)}
        </a>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No resume uploaded yet.</p>
      )}
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-brand-700 dark:text-gray-300"
        />
        <Button type="submit" size="sm" variant="outline" disabled={isPending} className="gap-1.5">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {isPending ? "Uploading..." : currentResumeUrl ? "Replace" : "Upload"}
        </Button>
      </form>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
    </div>
  );
}
