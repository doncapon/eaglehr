import { NIGERIA_STATE_LABELS, ORG_SIZE_LABELS, type NigeriaState, type OrgSize } from "@eaglehr/types";
import { Badge, CompanyAvatar } from "@eaglehr/ui";
import { BadgeCheck, Globe, MapPin, Sparkles, Users2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animated";
import { ApiError, publicApiFetch } from "@/lib/api";

interface CompanyJob {
  id: string;
  title: string;
  slug: string;
  employmentType: string;
  workMode: string;
  state: NigeriaState;
  city: string;
  salaryMinKobo: number | null;
  salaryMaxKobo: number | null;
  salaryIsPublic: boolean;
  isBoosted: boolean;
}

interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  size: OrgSize | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  verificationStatus: string;
  jobs: CompanyJob[];
}

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

async function getCompany(slug: string): Promise<CompanyDetail | null> {
  try {
    return await publicApiFetch<CompanyDetail>(`/companies/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return {};
  return {
    title: `${company.name} | EagleHire`,
    description: `${company.jobs.length} open role${company.jobs.length === 1 ? "" : "s"} at ${company.name} on EagleHire.`,
  };
}

function formatSalary(job: CompanyJob) {
  if (!job.salaryIsPublic || (!job.salaryMinKobo && !job.salaryMaxKobo)) return null;
  const min = job.salaryMinKobo ? `₦${(job.salaryMinKobo / 100).toLocaleString("en-NG")}` : null;
  const max = job.salaryMaxKobo ? `₦${(job.salaryMaxKobo / 100).toLocaleString("en-NG")}` : null;
  return [min, max].filter(Boolean).join(" – ");
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <FadeInUp className="relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-brand-50/60 p-6 shadow-soft dark:border-gray-800 dark:from-gray-950 dark:to-brand-950/40 sm:flex-row sm:items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-600/20"
        />
        <div className="relative">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size="lg" />
        </div>
        <div className="relative flex-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            {company.name}
            {company.verificationStatus === "APPROVED" ? (
              <BadgeCheck className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" aria-label="Verified company" />
            ) : null}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            {company.industry ? <span>{company.industry}</span> : null}
            {company.size ? (
              <span className="inline-flex items-center gap-1.5">
                <Users2 className="h-3.5 w-3.5" aria-hidden />
                {ORG_SIZE_LABELS[company.size]}
              </span>
            ) : null}
            {company.websiteUrl ? (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                Website
              </a>
            ) : null}
          </div>
        </div>
      </FadeInUp>

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Open roles <span className="text-brand-600 dark:text-brand-400">({company.jobs.length})</span>
        </h2>

        {company.jobs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No open roles right now — check back soon.</p>
        ) : (
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {company.jobs.map((job) => (
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
                    <h3 className="font-semibold leading-snug transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">
                      {job.title}
                    </h3>
                    {job.isBoosted ? (
                      <Badge className="shrink-0 gap-1 bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-glow-accent">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {job.city}, {NIGERIA_STATE_LABELS[job.state]}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1 text-xs">
                    <Badge variant="secondary">{job.employmentType.replace("_", " ")}</Badge>
                    <Badge variant="outline">{job.workMode}</Badge>
                    {formatSalary(job) ? <Badge variant="success">{formatSalary(job)}</Badge> : null}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
