import { Button } from "@eaglehr/ui";
import { ArrowRight, Briefcase, ClipboardCheck, ShieldCheck, UserCheck, Users2, Wallet } from "lucide-react";
import Link from "next/link";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animated";
import { publicApiFetch } from "@/lib/api";

const features = [
  {
    icon: Briefcase,
    title: "Post jobs in minutes",
    description: "Publish a role, set salary in Naira, and reach job seekers across Nigeria — no middleman.",
    tone: "brand" as const,
  },
  {
    icon: Users2,
    title: "Manage your HR team",
    description: "Invite recruiters and admins to a private workspace with role-based access, built for your company.",
    tone: "accent" as const,
  },
  {
    icon: Wallet,
    title: "Billing built for Nigeria",
    description: "Subscribe and pay with Paystack — plans priced in Naira, no foreign card required.",
    tone: "brand" as const,
  },
];

const steps = [
  { icon: ClipboardCheck, title: "Post a role", description: "Describe the job, set the salary band, and publish." },
  { icon: UserCheck, title: "Review applicants", description: "See every applicant's profile and move them through your pipeline." },
  { icon: ShieldCheck, title: "Hire with confidence", description: "Track status from applied to hired, all in one place." },
];

interface CountResponse {
  total: number;
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

async function getStats() {
  const [jobs, companies, facets] = await Promise.all([
    publicApiFetch<CountResponse>("/jobs?limit=1").catch(() => ({ total: 0 })),
    publicApiFetch<CountResponse>("/companies?limit=1").catch(() => ({ total: 0 })),
    publicApiFetch<FilterFacets>("/jobs/filter-facets").catch(() => ({
      employmentType: [],
      workMode: [],
      state: [],
      industry: [],
    })),
  ]);
  return { jobTotal: jobs.total, companyTotal: companies.total, industries: facets.industry.slice(0, 8) };
}

export default async function HomePage() {
  const { jobTotal, companyTotal, industries } = await getStats();

  return (
    <div className="flex flex-col gap-28 pb-16">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden px-4 pt-16 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-mesh-brand"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid bg-grid-cell [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 animate-float rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-500/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-1/4 -z-10 h-64 w-64 animate-float rounded-full bg-accent-400/35 blur-3xl [animation-delay:1.5s] dark:bg-accent-500/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-[10%] -z-10 h-48 w-48 animate-float rounded-full bg-brand-400/25 blur-3xl [animation-delay:3s] dark:bg-brand-600/20"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <FadeInUp className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-800 shadow-soft backdrop-blur dark:border-brand-800 dark:bg-gray-950/80 dark:text-brand-200">
            🇳🇬 Built for Nigerian employers and job seekers
          </FadeInUp>

          <FadeInUp delay={0.08}>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Hire and get hired,
              <br />
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-accent-400">
                built for Nigeria.
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.16}>
            <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
              EagleHR connects employers and job seekers across Nigeria — post jobs, manage applicants, and run your
              company&apos;s HR from one private workspace.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.24} className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/jobs" className="group">
                <Button size="lg" className="gap-1.5 shadow-glow-lg">
                  Browse jobs
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" aria-hidden />
                </Button>
              </Link>
              <Link href="/register" className="group">
                <Button size="lg" variant="outline" className="gap-1.5 border-2">
                  Post a job as an employer
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" aria-hidden />
                </Button>
              </Link>
            </div>
            <Link
              href="/companies"
              className="text-sm text-gray-500 underline-offset-4 transition-colors hover:text-brand-600 hover:underline dark:text-gray-400 dark:hover:text-brand-400"
            >
              or browse companies hiring now →
            </Link>
          </FadeInUp>

          <FadeInUp delay={0.3} className="mt-4 grid w-full grid-cols-3 gap-4 sm:max-w-md">
            {[
              { value: `${jobTotal}+`, label: "open roles" },
              { value: `${companyTotal}+`, label: "companies" },
              { value: "36", label: "states covered" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-4 shadow-soft backdrop-blur dark:border-gray-800/80 dark:bg-gray-950/70"
              >
                <span className="bg-gradient-to-br from-brand-600 to-accent-500 bg-clip-text text-2xl font-extrabold text-transparent dark:from-brand-400 dark:to-accent-400">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </FadeInUp>
        </div>
      </section>

      {/* Sector cloud */}
      {industries.length > 0 ? (
        <FadeInUp className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Hiring across every sector
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {industries.map((industry, index) => (
              <Link
                key={industry.value}
                href={`/jobs?industry=${encodeURIComponent(industry.value)}`}
                className="group relative overflow-hidden rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-glow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:text-brand-400"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {industry.value}
                <span className="ml-1.5 text-xs text-gray-400 group-hover:text-brand-500 dark:text-gray-600">
                  {industry.count}
                </span>
              </Link>
            ))}
          </div>
        </FadeInUp>
      ) : null}

      {/* Features */}
      <section className="flex flex-col gap-10">
        <FadeInUp className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to hire, in one place</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No spreadsheets, no back-and-forth emails — just a clean workspace for your whole hiring pipeline.
          </p>
        </FadeInUp>

        <StaggerContainer className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem
              key={feature.title}
              className={
                feature.tone === "brand"
                  ? "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-brand-50/60 p-6 shadow-soft transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-glow-lg dark:border-gray-800 dark:from-gray-950 dark:to-brand-950/40"
                  : "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-accent-50/60 p-6 shadow-soft transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-accent-300 hover:shadow-glow-accent dark:border-gray-800 dark:from-gray-950 dark:to-accent-950/40"
              }
            >
              <div
                aria-hidden
                className={
                  feature.tone === "brand"
                    ? "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-300/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-brand-600/20"
                    : "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-300/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-accent-600/20"
                }
              />
              <div
                className={
                  feature.tone === "brand"
                    ? "relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow transition-all duration-300 ease-out-expo group-hover:scale-110 group-hover:rotate-3"
                    : "relative flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white shadow-glow-accent transition-all duration-300 ease-out-expo group-hover:scale-110 group-hover:rotate-3"
                }
              >
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="relative font-semibold">{feature.title}</h3>
              <p className="relative text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-10">
        <FadeInUp className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How hiring works on EagleHR</h2>
        </FadeInUp>

        <StaggerContainer className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <StaggerItem key={step.title} className="group relative flex flex-col items-center gap-3 text-center">
              {index < steps.length - 1 ? (
                <div
                  aria-hidden
                  className="absolute left-1/2 top-6 hidden h-0.5 w-full bg-gradient-to-r from-brand-400 via-accent-400 to-transparent sm:block"
                />
              ) : null}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-glow-lg transition-transform duration-300 ease-out-expo group-hover:scale-110">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Final CTA */}
      <FadeInUp>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 px-8 py-16 text-center text-white shadow-glow-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-hero-grid bg-grid-cell opacity-10 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 animate-float rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-10 h-40 w-40 animate-float rounded-full bg-white/10 blur-3xl [animation-delay:2s]"
          />
          <h2 className="relative text-3xl font-bold sm:text-4xl">Ready to build your team?</h2>
          <p className="relative mx-auto mt-2 max-w-lg text-brand-50">
            Create your company&apos;s private workspace and post your first job today.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="group">
              <Button
                size="lg"
                variant="outline"
                className="gap-1.5 border-white bg-white text-brand-700 shadow-lift hover:bg-brand-50"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>
      </FadeInUp>
    </div>
  );
}
