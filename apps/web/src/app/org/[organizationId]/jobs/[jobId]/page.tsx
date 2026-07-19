import { Badge, Button } from "@eaglehr/ui";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { deleteJobAction, publishJobAction } from "@/lib/job-actions";
import { BoostJobButton } from "./boost-job-button";
import { JobEditForm } from "./job-edit-form";

interface Job {
  id: string;
  title: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  employmentType: string;
  workMode: string;
  state: string;
  city: string;
  salaryMinKobo: number | null;
  salaryMaxKobo: number | null;
  status: string;
  isBoosted: boolean;
  boostExpiresAt: string | null;
}

interface JobDetailPageProps {
  params: Promise<{ organizationId: string; jobId: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { organizationId, jobId } = await params;
  const job = await apiFetch<Job>(`/organizations/${organizationId}/jobs/${jobId}`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <Badge variant={job.status === "PUBLISHED" ? "success" : "secondary"}>{job.status}</Badge>
          {job.isBoosted && job.boostExpiresAt ? (
            <Badge variant="warning" className="gap-1">
              <Sparkles className="h-3 w-3" aria-hidden />
              Featured until {new Date(job.boostExpiresAt).toLocaleDateString("en-NG")}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/org/${organizationId}/jobs/${jobId}/applicants`}>
            <Button variant="outline">View applicants</Button>
          </Link>
          {job.status !== "PUBLISHED" ? (
            <form action={publishJobAction.bind(null, organizationId, jobId)}>
              <Button type="submit">Publish</Button>
            </form>
          ) : null}
          {!job.isBoosted && job.status === "PUBLISHED" ? (
            <BoostJobButton organizationId={organizationId} jobId={jobId} />
          ) : null}
          <form action={deleteJobAction.bind(null, organizationId, jobId)}>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>
      <JobEditForm organizationId={organizationId} jobId={jobId} job={job} />
    </div>
  );
}
