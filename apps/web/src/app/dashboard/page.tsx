import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eaglehr/ui";
import { ArrowRight, Briefcase, FileText, Plus, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animated";
import { VerificationNudgeBanner } from "@/components/verification-nudge-banner";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, getMyOrganizations, type OrganizationSummary } from "@/lib/session";

interface OrgJobSummary {
  id: string;
  status: string;
}

interface MyApplicationSummary {
  id: string;
}

async function jobCountsForOrg(organizationId: string) {
  const jobs = await apiFetch<OrgJobSummary[]>(`/organizations/${organizationId}/jobs`).catch(() => []);
  return {
    total: jobs.length,
    open: jobs.filter((job) => job.status === "PUBLISHED").length,
  };
}

function orgInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

async function EmployerDashboard({
  firstName,
  organizations,
  isEmailVerified,
}: {
  firstName: string;
  organizations: OrganizationSummary[];
  isEmailVerified: boolean;
}) {
  const orgsWithCounts = await Promise.all(
    organizations.map(async (org) => ({ org, counts: await jobCountsForOrg(org.id) })),
  );
  const needsVerification = !isEmailVerified || organizations.some((org) => org.verificationStatus !== "APPROVED");

  return (
    <div className="flex flex-col gap-8">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage jobs, applicants, and HR for your organizations.</p>
      </FadeInUp>

      {needsVerification ? (
        <VerificationNudgeBanner message="Verify your email and company documents to earn a trust badge candidates can see." />
      ) : null}

      <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {orgsWithCounts.map(({ org, counts }) => (
          <StaggerItem key={org.id}>
            <Link
              href={`/org/${org.id}/dashboard`}
              className="group flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {orgInitial(org.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-brand-700 dark:group-hover:text-brand-400">
                    {org.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {counts.open} open · {counts.total} total job
                    {counts.total === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between text-sm text-brand-600 dark:text-brand-400">
                Manage company
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>
          </StaggerItem>
        ))}
        <StaggerItem>
          <Link
            href="/onboarding/organization"
            className="flex h-full min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-5 text-sm font-medium text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-600 dark:hover:text-brand-400"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Add another company
          </Link>
        </StaggerItem>
      </StaggerContainer>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Looking for a job too?{" "}
        <Link href="/jobs" className="text-brand-600 hover:underline dark:text-brand-400">
          Browse open jobs
        </Link>
      </p>
    </div>
  );
}

async function JobSeekerDashboard({ firstName, isEmailVerified }: { firstName: string; isEmailVerified: boolean }) {
  const [profile, applications] = await Promise.all([
    apiFetch<{ headline: string | null; resumeUrl: string | null; verificationStatus: string } | null>(
      "/me/profile",
    ).catch(() => null),
    apiFetch<MyApplicationSummary[]>("/me/applications").catch(() => []),
  ]);
  const needsVerification = !isEmailVerified || (profile?.verificationStatus ?? "UNVERIFIED") !== "APPROVED";

  return (
    <div className="flex flex-col gap-8">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-gray-500 dark:text-gray-400">Here&apos;s what&apos;s happening with your job search.</p>
      </FadeInUp>

      {needsVerification ? (
        <VerificationNudgeBanner message="Verify your email and identity to earn a trust badge employers can see." />
      ) : null}

      <StaggerContainer className="grid gap-5 sm:grid-cols-3">
        <StaggerItem>
          <Card className="h-full hover:shadow-glow">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                <FileText className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-2xl font-bold">{profile ? "Complete" : "Not started"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile?.resumeUrl ? "Profile & CV on file" : "Profile status"}
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="h-full hover:shadow-glow">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300">
                <Briefcase className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Application{applications.length === 1 ? "" : "s"} submitted</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="h-full hover:shadow-glow">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Sparkles className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-2xl font-bold">Nigeria</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jobs open across every state</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <Card>
        <CardHeader>
          <CardTitle>Job hunting</CardTitle>
          <CardDescription>Build your profile and track applications.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full justify-start">
              {profile ? "Edit your profile" : "Build your job seeker profile"}
            </Button>
          </Link>
          <Link href="/applications" className="flex-1">
            <Button variant="outline" className="w-full justify-start">
              View my applications
            </Button>
          </Link>
          <Link href="/jobs" className="flex-1">
            <Button variant="outline" className="w-full justify-start">
              Browse open jobs
            </Button>
          </Link>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Hiring instead?{" "}
        <Link href="/onboarding/organization" className="text-brand-600 hover:underline dark:text-brand-400">
          Set up your company
        </Link>
      </p>
    </div>
  );
}

async function AdminDashboard({ firstName }: { firstName: string }) {
  const [pendingJobSeekers, pendingOrganizations] = await Promise.all([
    apiFetch<{ id: string }[]>("/admin/verifications/job-seekers?status=PENDING").catch(() => []),
    apiFetch<{ id: string }[]>("/admin/verifications/organizations?status=PENDING").catch(() => []),
  ]);
  const pendingTotal = pendingJobSeekers.length + pendingOrganizations.length;

  return (
    <div className="flex flex-col gap-8">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-gray-500 dark:text-gray-400">Platform administration for EagleHR.</p>
      </FadeInUp>

      <StaggerContainer className="grid gap-5 sm:grid-cols-3">
        <StaggerItem>
          <Link href="/admin/verifications">
            <Card className="h-full hover:shadow-glow">
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-2xl font-bold">{pendingJobSeekers.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Job seeker{pendingJobSeekers.length === 1 ? "" : "s"} awaiting review</p>
              </CardContent>
            </Card>
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link href="/admin/verifications">
            <Card className="h-full hover:shadow-glow">
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  <Users className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-2xl font-bold">{pendingOrganizations.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compan{pendingOrganizations.length === 1 ? "y" : "ies"} awaiting review</p>
              </CardContent>
            </Card>
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Card className="h-full hover:shadow-glow">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Sparkles className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-2xl font-bold">{pendingTotal}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total pending verifications</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
          <CardDescription>Review verification requests and manage platform-wide settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin/verifications" className="flex-1">
            <Button className="w-full justify-start">
              Review verifications
              {pendingTotal > 0 ? ` (${pendingTotal})` : ""}
            </Button>
          </Link>
          <Link href="/admin/settings" className="flex-1">
            <Button variant="outline" className="w-full justify-start">
              Platform settings
            </Button>
          </Link>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Also here to browse?{" "}
        <Link href="/jobs" className="text-brand-600 hover:underline dark:text-brand-400">
          Find jobs
        </Link>{" "}
        or{" "}
        <Link href="/companies" className="text-brand-600 hover:underline dark:text-brand-400">
          view companies
        </Link>
        .
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.isPlatformAdmin) {
    return <AdminDashboard firstName={user.firstName} />;
  }

  const organizations = await getMyOrganizations();

  if (organizations.length > 0) {
    return (
      <EmployerDashboard firstName={user.firstName} organizations={organizations} isEmailVerified={user.isEmailVerified} />
    );
  }
  return <JobSeekerDashboard firstName={user.firstName} isEmailVerified={user.isEmailVerified} />;
}
