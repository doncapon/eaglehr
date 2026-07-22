import { NIGERIA_STATE_LABELS, type NigeriaState } from "@eaglehr/types";
import { Badge } from "@eaglehr/ui";
import { Building2, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/animated";
import { Pagination } from "@/components/pagination";
import { publicApiFetch } from "@/lib/api";
import { JobFilters } from "./job-filters";

interface Job {
  id: string;
  title: string;
  slug: string;
  city: string;
  state: NigeriaState;
  employmentType: string;
  workMode: string;
  salaryMinKobo: number | null;
  salaryMaxKobo: number | null;
  salaryIsPublic: boolean;
  isBoosted: boolean;
  organization: { name: string };
}

interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  limit: number;
}

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    state?: string;
    employmentType?: string | string[];
    workMode?: string | string[];
    industry?: string | string[];
    minSalary?: string;
    maxSalary?: string;
    page?: string;
  }>;
}

interface SalaryRange {
  minKobo: number;
  maxKobo: number;
}

interface FilterCount {
  value: string;
  count: number;
}

interface FilterFacets {
  employmentType: FilterCount[];
  workMode: FilterCount[];
  state: FilterCount[];
  industry: FilterCount[];
}

export const revalidate = 60;

function formatSalary(job: Job) {
  if (!job.salaryIsPublic || (!job.salaryMinKobo && !job.salaryMaxKobo)) return null;
  const naira = (kobo: number) => `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
  if (job.salaryMinKobo && job.salaryMaxKobo && job.salaryMinKobo !== job.salaryMaxKobo) {
    return `${naira(job.salaryMinKobo)} – ${naira(job.salaryMaxKobo)}`;
  }
  return naira(job.salaryMinKobo ?? job.salaryMaxKobo ?? 0);
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const employmentType = toArray(params.employmentType);
  const workMode = toArray(params.workMode);
  const industry = toArray(params.industry);

  const minSalaryKobo = params.minSalary ? Math.round(Number(params.minSalary) * 100) : undefined;
  const maxSalaryKobo = params.maxSalary ? Math.round(Number(params.maxSalary) * 100) : undefined;

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.state) query.set("state", params.state);
  employmentType.forEach((type) => query.append("employmentType", type));
  workMode.forEach((mode) => query.append("workMode", mode));
  industry.forEach((value) => query.append("industry", value));
  if (minSalaryKobo !== undefined) query.set("minSalaryKobo", String(minSalaryKobo));
  if (maxSalaryKobo !== undefined) query.set("maxSalaryKobo", String(maxSalaryKobo));
  if (params.page) query.set("page", params.page);

  const [{ items, total, page, limit }, salaryRange, facets] = await Promise.all([
    publicApiFetch<JobListResponse>(`/jobs?${query.toString()}`),
    publicApiFetch<SalaryRange>("/jobs/salary-range"),
    publicApiFetch<FilterFacets>("/jobs/filter-facets"),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasActiveFilters = Boolean(
    params.q ||
      params.state ||
      employmentType.length ||
      workMode.length ||
      industry.length ||
      params.minSalary ||
      params.maxSalary,
  );

  const buildHref = (targetPage: number) => {
    const hrefParams = new URLSearchParams();
    if (params.q) hrefParams.set("q", params.q);
    if (params.state) hrefParams.set("state", params.state);
    employmentType.forEach((type) => hrefParams.append("employmentType", type));
    workMode.forEach((mode) => hrefParams.append("workMode", mode));
    industry.forEach((value) => hrefParams.append("industry", value));
    if (params.minSalary) hrefParams.set("minSalary", params.minSalary);
    if (params.maxSalary) hrefParams.set("maxSalary", params.maxSalary);
    if (targetPage > 1) hrefParams.set("page", String(targetPage));
    const qs = hrefParams.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-20 lg:w-64">
        <h2 className="mb-4 font-semibold">Filter jobs</h2>
        <JobFilters
          q={params.q}
          state={params.state}
          employmentType={employmentType}
          workMode={workMode}
          industry={industry}
          facets={facets}
          minSalary={params.minSalary}
          maxSalary={params.maxSalary}
          salaryFloor={Math.floor(salaryRange.minKobo / 100)}
          salaryCeiling={Math.ceil(salaryRange.maxKobo / 100)}
          hasActiveFilters={hasActiveFilters}
        />
      </aside>

      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Find your next role</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-brand-600 dark:text-brand-400">{total}</span> open job
            {total === 1 ? "" : "s"} across Nigeria
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No jobs match your search yet. Try different filters.</p>
        ) : (
          <>
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((job) => (
              <StaggerItem key={job.id}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className={
                    job.isBoosted
                      ? "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-accent-300 bg-gradient-to-br from-white to-accent-50/70 p-5 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-1.5 hover:shadow-glow-accent dark:border-accent-800 dark:from-gray-950 dark:to-accent-950/40"
                      : "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-glow dark:border-gray-800 dark:bg-gray-950"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-snug transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">
                      {job.title}
                    </h2>
                    {job.isBoosted ? (
                      <Badge className="shrink-0 gap-1 bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-glow-accent">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{job.organization.name}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        {job.city}, {NIGERIA_STATE_LABELS[job.state]}
                      </span>
                    </span>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1 text-xs">
                    <Badge variant="secondary">{job.employmentType.replace("_", " ")}</Badge>
                    <Badge variant="outline">{job.workMode}</Badge>
                    {formatSalary(job) ? <Badge variant="success">{formatSalary(job)}</Badge> : null}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </>
        )}
      </div>
    </div>
  );
}
