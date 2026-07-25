"use client";

import { cn } from "@eaglehr/ui";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { JobFilters, type JobFiltersProps } from "./job-filters";

interface JobsFilterShellProps extends Omit<JobFiltersProps, "onNavigate" | "isPending"> {
  children: ReactNode;
}

export function JobsFilterShell({ children, ...filterProps }: JobsFilterShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  // Filters start open on mobile too (unchanged landing view) — this just adds a way
  // to collapse them out of the way and bring the results into focus.
  const [filtersOpen, setFiltersOpen] = useState(true);

  function navigate(params: URLSearchParams) {
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    });
    // Filter controls near the bottom of a long sidebar (mobile especially) can leave
    // the results scrolled out of view — bring them back in, no-op if already visible.
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-soft dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {filtersOpen ? "Hide filters" : "Filter jobs"}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} aria-hidden />
      </button>

      <aside
        className={cn(
          filtersOpen ? "block" : "hidden",
          "w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-gray-950 lg:block lg:sticky lg:top-20 lg:w-64",
        )}
      >
        <h2 className="mb-4 hidden font-semibold lg:block">Filter jobs</h2>
        <JobFilters {...filterProps} onNavigate={navigate} isPending={isPending} />
      </aside>

      {/* Old results stay visible (dimmed) while the new page streams in, instead of
          the native form-GET full-page navigation that used to blank the screen first. */}
      <div
        ref={resultsRef}
        className={cn("flex-1 scroll-mt-24 transition-opacity duration-150", isPending && "pointer-events-none opacity-50")}
      >
        {children}
      </div>
    </div>
  );
}
