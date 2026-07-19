import { Badge, Button } from "@eaglehr/ui";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  status: string;
  employmentType: string;
  city: string;
  state: string;
}

interface OrgJobsPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrgJobsPage({ params }: OrgJobsPageProps) {
  const { organizationId } = await params;
  const jobs = await apiFetch<Job[]>(`/organizations/${organizationId}/jobs`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link href={`/org/${organizationId}/jobs/new`}>
          <Button>Post a job</Button>
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No jobs yet. Post your first one.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/org/${organizationId}/jobs/${job.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {job.city}, {job.state} &middot; {job.employmentType.replace("_", " ")}
                </p>
              </div>
              <Badge variant={job.status === "PUBLISHED" ? "success" : job.status === "DRAFT" ? "secondary" : "outline"}>
                {job.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
