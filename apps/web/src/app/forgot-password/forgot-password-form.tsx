"use client";

import { Button, Label } from "@eaglehr/ui";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { FadeInUp } from "@/components/animated";
import { AuthShell } from "@/components/auth-shell";
import { IconInput } from "@/components/icon-input";
import { forgotPasswordAction } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      bullets={[
        "Works for both job seeker and company accounts",
        "The link expires in 1 hour",
        "You'll stay signed out until you set a new password",
      ]}
    >
      <FadeInUp className="flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We&apos;ll email you a link to choose a new one.
          </p>
        </div>

        {state?.success ? (
          <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            {state.success}
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <IconInput icon={Mail} id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
            <Button type="submit" disabled={isPending} className="mt-2 shadow-glow">
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Remembered it?{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </FadeInUp>
    </AuthShell>
  );
}
