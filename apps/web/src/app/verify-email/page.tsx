import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { FadeInUp } from "@/components/animated";
import { ApiError, publicApiFetch } from "@/lib/api";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  let error: string | null = null;
  if (!token) {
    error = "This verification link is missing its token.";
  } else {
    try {
      await publicApiFetch("/auth/verify-email", { method: "POST", body: { token } });
    } catch (err) {
      error = err instanceof ApiError ? err.message : "Failed to verify your email.";
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
      <FadeInUp className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <XCircle className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold">Verification failed</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold">Email verified</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your email address has been confirmed.</p>
          </>
        )}
        <Link
          href="/verify"
          className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift"
        >
          Continue
        </Link>
      </FadeInUp>
    </div>
  );
}
