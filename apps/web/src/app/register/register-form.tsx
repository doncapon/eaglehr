"use client";

import { Button, Input, Label, cn } from "@eaglehr/ui";
import { Briefcase, Building2, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { FadeInUp } from "@/components/animated";
import { AuthShell } from "@/components/auth-shell";
import { IconInput } from "@/components/icon-input";
import { PasswordInput } from "@/components/password-input";
import { registerAction } from "@/lib/auth-actions";

type AccountType = "jobseeker" | "company";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [accountType, setAccountType] = useState<AccountType>("jobseeker");

  return (
    <AuthShell
      tone={accountType === "company" ? "accent" : "brand"}
      title={accountType === "company" ? "Hire on EagleHR." : "Join EagleHR."}
      subtitle={
        accountType === "company"
          ? "Set up your company's private hiring workspace in minutes."
          : "One account for landing your next role across Nigeria."
      }
      bullets={
        accountType === "company"
          ? [
              "Post jobs and manage applicants in one workspace",
              "Invite your HR team with role-based access",
              "Boost listings to reach more candidates",
            ]
          : [
              "Build a profile employers can find",
              "Apply to jobs across Nigeria in a click",
              "Track every application in one place",
            ]
      }
    >
      <FadeInUp className="flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {accountType === "company"
              ? "Set up your company's private hiring workspace."
              : "Build your profile and start applying to jobs."}
          </p>
        </div>

        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "jobseeker"}
            onClick={() => setAccountType("jobseeker")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all duration-200 ease-out-expo",
              accountType === "jobseeker"
                ? "bg-white text-gray-900 shadow-soft dark:bg-gray-800 dark:text-gray-50"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            Job seeker
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "company"}
            onClick={() => setAccountType("company")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all duration-200 ease-out-expo",
              accountType === "company"
                ? "bg-white text-gray-900 shadow-soft dark:bg-gray-800 dark:text-gray-50"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            Company
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="accountType" value={accountType} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <IconInput icon={User} id="firstName" name="firstName" required autoComplete="given-name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required autoComplete="family-name" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <IconInput icon={Mail} id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <IconInput icon={Phone} id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234..." />
          </div>
          {accountType === "company" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <IconInput
                icon={Building2}
                id="companyName"
                name="companyName"
                required
                minLength={2}
                placeholder="Acme Nigeria Ltd"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" required autoComplete="new-password" minLength={8} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
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
            {isPending ? "Creating account..." : accountType === "company" ? "Create company account" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
            Sign in
          </Link>
        </p>
      </FadeInUp>
    </AuthShell>
  );
}
