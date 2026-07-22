"use client";

import { Button, Label } from "@eaglehr/ui";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { FadeInUp } from "@/components/animated";
import { AuthShell } from "@/components/auth-shell";
import { IconInput } from "@/components/icon-input";
import { PasswordInput } from "@/components/password-input";
import { loginAction } from "@/lib/auth-actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const justRegistered = searchParams.get("registered") === "1";
  // Stale error/hint from a previous submission shouldn't linger once the user
  // starts editing again — clear it as soon as they retype either field.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDirty(false);
  }, [state]);

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to manage your hiring pipeline or pick up your job search where you left off."
      bullets={[
        "Post jobs and manage applicants in one workspace",
        "Track every application from applied to hired",
        "Billing and job boosts, priced in Naira",
      ]}
    >
      <FadeInUp className="flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back to EagleHR.</p>
        </div>
        {justRegistered ? (
          <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Account created. Check your email to verify it, then sign in below.
          </p>
        ) : null}
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <IconInput
              icon={Mail}
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              onChange={() => setDirty(true)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              onChange={() => setDirty(true)}
            />
          </div>
          {state?.error && !dirty ? (
            <p className="text-sm text-red-600">
              {state.error}
              {state.showForgotPasswordHint ? (
                <>
                  {" "}
                  <Link href="/forgot-password" className="font-medium underline">
                    Forgot your password?
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className="mt-2 shadow-glow">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
            Create one
          </Link>
        </p>
      </FadeInUp>
    </AuthShell>
  );
}
