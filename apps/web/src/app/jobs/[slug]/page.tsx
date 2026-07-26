import { NIGERIA_STATE_LABELS, type NigeriaState } from "@eaglehr/types";
import { Badge } from "@eaglehr/ui";
import { Building2, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeInUp } from "@/components/animated";
import { ApiError, apiFetch, publicApiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { ApplyForm } from "./apply-form";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  employmentType: string;
  workMode: string;
  state: NigeriaState;
  city: string;
  salaryMinKobo: number | null;
  salaryMaxKobo: number | null;
  salaryIsPublic: boolean;
  organization: { name: string; websiteUrl: string | null };
}

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getJob(slug: string): Promise<JobDetail | null> {
  try {
    return await publicApiFetch<JobDetail>(`/jobs/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return {
    title: `${job.title} at ${job.organization.name} | EagleHire`,
    description: job.description.slice(0, 160),
  };
}

function formatSalary(job: JobDetail) {
  if (!job.salaryIsPublic || (!job.salaryMinKobo && !job.salaryMaxKobo)) return null;
  const naira = (kobo: number) => `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
  if (job.salaryMinKobo && job.salaryMaxKobo && job.salaryMinKobo !== job.salaryMaxKobo) {
    return `${naira(job.salaryMinKobo)} – ${naira(job.salaryMaxKobo)}/month`;
  }
  return `${naira(job.salaryMinKobo ?? job.salaryMaxKobo ?? 0)}/month`;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) {
    notFound();
  }

  const user = await getCurrentUser();
  const profile = user ? await apiFetch<{ resumeUrl: string | null } | null>("/me/profile") : null;
  const salary = formatSalary(job);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization.name,
      sameAs: job.organization.websiteUrl ?? undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: NIGERIA_STATE_LABELS[job.state],
        addressCountry: "NG",
      },
    },
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <FadeInUp className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-brand-50/60 p-6 shadow-soft dark:border-gray-800 dark:from-gray-950 dark:to-brand-950/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-600/20"
        />
        <div className="relative flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0" aria-hidden />
              {job.organization.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {job.city}, {NIGERIA_STATE_LABELS[job.state]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.employmentType.replace("_", " ")}</Badge>
            <Badge variant="outline">{job.workMode}</Badge>
            {salary ? <Badge variant="success">{salary}</Badge> : null}
          </div>
        </div>
      </FadeInUp>

      <FadeInUp
        delay={0.08}
        className="flex flex-col gap-4 whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-6 text-sm leading-relaxed shadow-soft dark:border-gray-800 dark:bg-gray-950"
      >
        <p>{job.description}</p>
        {job.responsibilities ? (
          <div>
            <h3 className="mb-1 font-semibold text-brand-700 dark:text-brand-400">Responsibilities</h3>
            <p>{job.responsibilities}</p>
          </div>
        ) : null}
        {job.requirements ? (
          <div>
            <h3 className="mb-1 font-semibold text-brand-700 dark:text-brand-400">Requirements</h3>
            <p>{job.requirements}</p>
          </div>
        ) : null}
      </FadeInUp>

      <FadeInUp delay={0.16}>
        <ApplyForm jobId={job.id} jobSlug={slug} isLoggedIn={Boolean(user)} resumeUrl={profile?.resumeUrl ?? null} />
      </FadeInUp>
    </div>
  );
}
