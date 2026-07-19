"use client";

import { Button, Label } from "@eaglehr/ui";
import Link from "next/link";
import { useActionState } from "react";
import { FadeInUp } from "@/components/animated";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { resetPasswordAction } from "@/lib/auth-actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction.bind(null, token), undefined);

  return (
    <AuthShell
      title="Choose a new password."
      subtitle="Pick something you haven't used before and you'll be back in."
      bullets={["At least 8 characters", "Works across web and desktop", "Sign in with it right after"]}
    >
      <FadeInUp className="flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Set a new password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose a new password for your account.</p>
        </div>

        {state?.success ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
              {state.success}
            </p>
            <Link
              href="/login"
              className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-glow transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <PasswordInput id="password" name="password" required autoComplete="new-password" minLength={8} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
            <Button type="submit" disabled={isPending} className="mt-2 shadow-glow">
              {isPending ? "Saving..." : "Reset password"}
            </Button>
          </form>
        )}
      </FadeInUp>
    </AuthShell>
  );
}
