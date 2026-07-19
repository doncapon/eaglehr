"use client";

import { Button } from "@eaglehr/ui";
import { CheckCircle2, Mail } from "lucide-react";
import { useActionState } from "react";
import { resendVerificationEmailAction } from "@/lib/verification-actions";

export function EmailVerificationBanner({ isVerified }: { isVerified: boolean }) {
  const [state, formAction, isPending] = useActionState(resendVerificationEmailAction, undefined);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        Your email address is verified.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-200">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        Please verify your email address — check your inbox for a confirmation link.
      </div>
      <form action={formAction}>
        <Button type="submit" size="sm" variant="outline" disabled={isPending} className="w-fit">
          {isPending ? "Sending..." : "Resend verification email"}
        </Button>
      </form>
      {state?.error ? <p className="text-red-600 dark:text-red-400">{state.error}</p> : null}
      {state?.success ? <p className="text-green-700 dark:text-green-400">{state.success}</p> : null}
    </div>
  );
}
