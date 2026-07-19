"use client";

import { Button, Textarea } from "@eaglehr/ui";
import Link from "next/link";
import { useActionState } from "react";
import { ResumeUploadField } from "@/components/resume-upload-field";
import { applyToJobAction } from "@/lib/job-actions";

interface ApplyFormProps {
  jobId: string;
  jobSlug: string;
  isLoggedIn: boolean;
  resumeUrl: string | null;
}

export function ApplyForm({ jobId, jobSlug, isLoggedIn, resumeUrl }: ApplyFormProps) {
  const [state, formAction, isPending] = useActionState(applyToJobAction.bind(null, jobId), undefined);

  if (!isLoggedIn) {
    const next = encodeURIComponent(`/jobs/${jobSlug}`);
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">Sign in to apply for this role.</p>
        <Link href={`/login?next=${next}`} className="mt-2 inline-block">
          <Button>Sign in to apply</Button>
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        {state.success}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="font-semibold">Apply for this role</h3>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Your CV</p>
        <ResumeUploadField currentResumeUrl={resumeUrl} />
        {!resumeUrl ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a CV so the employer can review it — you can still apply without one.
          </p>
        ) : null}
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <Textarea name="coverLetter" placeholder="Add a short note to the employer (optional)" rows={4} />
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Submitting..." : "Submit application"}
        </Button>
      </form>
    </div>
  );
}
