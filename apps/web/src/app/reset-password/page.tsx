import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title="Link missing"
        subtitle="This password reset link is missing its token."
        bullets={["Request a new link from the forgot password page", "Links expire after 1 hour", "Check you copied the full link from your email"]}
      >
        <div className="flex w-full max-w-sm flex-col gap-4 text-center">
          <h1 className="text-2xl font-bold">This link isn&apos;t valid</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The reset link is missing its token. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-glow transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return <ResetPasswordForm token={token} />;
}
