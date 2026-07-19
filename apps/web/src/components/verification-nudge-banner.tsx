import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function VerificationNudgeBanner({ message }: { message: string }) {
  return (
    <Link
      href="/verify"
      className="flex items-center justify-between gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800 transition-colors hover:bg-accent-100 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-200 dark:hover:bg-accent-900"
    >
      <span className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
        {message}
      </span>
      <span className="shrink-0 font-medium underline">Verify now</span>
    </Link>
  );
}
