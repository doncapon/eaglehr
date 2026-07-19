import { cn } from "@eaglehr/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p += 1) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : undefined}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-sm transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:hover:text-brand-400",
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="sr-only">Previous page</span>
      </Link>

      {pageNumbers.map((p, idx) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors",
              p === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:hover:text-brand-400",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        tabIndex={page === totalPages ? -1 : undefined}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-sm transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:hover:text-brand-400",
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
