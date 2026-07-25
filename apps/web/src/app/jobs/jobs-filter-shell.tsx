"use client";

import { cn } from "@eaglehr/ui";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { JobFilters, type JobFiltersProps } from "./job-filters";

interface JobsFilterShellProps extends Omit<JobFiltersProps, "onNavigate" | "isPending"> {
  children: ReactNode;
}

export function JobsFilterShell({ children, ...filterProps }: JobsFilterShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(params: URLSearchParams) {
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-20 lg:w-64">
        <h2 className="mb-4 font-semibold">Filter jobs</h2>
        <JobFilters {...filterProps} onNavigate={navigate} isPending={isPending} />
      </aside>

      {/* Old results stay visible (dimmed) while the new page streams in, instead of
          the native form-GET full-page navigation that used to blank the screen first. */}
      <div className={cn("flex-1 transition-opacity duration-150", isPending && "pointer-events-none opacity-50")}>
        {children}
      </div>
    </div>
  );
}
