import { ORG_SIZE_LABELS, type OrgSize } from "@eaglehr/types";
import { Badge, CompanyAvatar } from "@eaglehr/ui";
import { BadgeCheck, Briefcase, Sparkles } from "lucide-react";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/animated";
import { Pagination } from "@/components/pagination";
import { publicApiFetch } from "@/lib/api";
import { CompaniesSearch } from "./companies-search";

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  size: OrgSize | null;
  logoUrl: string | null;
  isBoosted: boolean;
  verificationStatus: string;
  _count: { jobs: number };
}

interface CompanyListResponse {
  items: Company[];
  total: number;
  page: number;
  limit: number;
}

interface CompaniesPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const revalidate = 60;

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (pageParam) query.set("page", pageParam);

  const { items, total, page, limit } = await publicApiFetch<CompanyListResponse>(`/companies?${query.toString()}`);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/companies?${qs}` : "/companies";
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Companies{" "}
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-400">
            hiring
          </span>{" "}
          on EagleHR
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-brand-600 dark:text-brand-400">{total}</span> compan
          {total === 1 ? "y" : "ies"} with open roles
        </p>
      </div>

      <CompaniesSearch initialQuery={q ?? ""} />

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No companies match your search yet.</p>
      ) : (
        <>
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((company) => (
              <StaggerItem key={company.id}>
                <Link
                  href={`/companies/${company.slug}`}
                  className={
                    company.isBoosted
                      ? "group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-accent-300 bg-gradient-to-br from-white to-accent-50/70 p-5 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-1.5 hover:shadow-glow-accent dark:border-accent-800 dark:from-gray-950 dark:to-accent-950/40"
                      : "group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-glow dark:border-gray-800 dark:bg-gray-950"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
                      <div className="min-w-0">
                        <h2 className="flex items-center gap-1.5 truncate font-semibold transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">
                          <span className="truncate">{company.name}</span>
                          {company.verificationStatus === "APPROVED" ? (
                            <BadgeCheck
                              className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400"
                              aria-label="Verified company"
                            />
                          ) : null}
                        </h2>
                        {company.industry ? (
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
                        ) : null}
                      </div>
                    </div>
                    {company.isBoosted ? (
                      <Badge className="shrink-0 gap-1 bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-glow-accent">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-400">
                      <Briefcase className="h-3.5 w-3.5" aria-hidden />
                      {company._count.jobs} open role{company._count.jobs === 1 ? "" : "s"}
                    </span>
                    {company.size ? <span>{ORG_SIZE_LABELS[company.size]}</span> : null}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}
