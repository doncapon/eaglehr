import { Card, CardContent, CardHeader, CardTitle } from "@eaglehr/ui";
import { apiFetch } from "@/lib/api";

interface Job {
  id: string;
  status: string;
}

interface OrgDashboardPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const { organizationId } = await params;
  const jobs = await apiFetch<Job[]>(`/organizations/${organizationId}/jobs`);

  const published = jobs.filter((job) => job.status === "PUBLISHED").length;
  const drafts = jobs.filter((job) => job.status === "DRAFT").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{jobs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{published}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{drafts}</CardContent>
        </Card>
      </div>
    </div>
  );
}
