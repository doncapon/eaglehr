import { APPLICATION_STATUSES } from "@eaglehr/types";
import { Badge, Button, Card, CardContent, Select } from "@eaglehr/ui";
import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { updateApplicationStatusAction } from "@/lib/job-actions";

interface Applicant {
  id: string;
  status: string;
  coverLetter: string | null;
  resumeUrlSnapshot: string | null;
  jobSeekerProfile: {
    headline: string | null;
    yearsOfExperience: number | null;
    resumeUrl: string | null;
    skills: string[];
    user: { firstName: string; lastName: string; email: string; phone: string | null };
  };
}

interface ApplicantsPageProps {
  params: Promise<{ organizationId: string; jobId: string }>;
}

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const { organizationId, jobId } = await params;
  const applicants = await apiFetch<Applicant[]>(`/organizations/${organizationId}/jobs/${jobId}/applications`);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Applicants ({applicants.length})</h1>
      {applicants.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {applicant.jobSeekerProfile.user.firstName} {applicant.jobSeekerProfile.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {applicant.jobSeekerProfile.user.email}
                      {applicant.jobSeekerProfile.user.phone ? ` · ${applicant.jobSeekerProfile.user.phone}` : ""}
                    </p>
                    {applicant.jobSeekerProfile.headline ? (
                      <p className="text-sm">{applicant.jobSeekerProfile.headline}</p>
                    ) : null}
                    {applicant.jobSeekerProfile.skills.length > 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {applicant.jobSeekerProfile.skills.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <Badge>{applicant.status}</Badge>
                </div>
                {applicant.coverLetter ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{applicant.coverLetter}</p>
                ) : null}
                {applicant.resumeUrlSnapshot ?? applicant.jobSeekerProfile.resumeUrl ? (
                  <a
                    href={applicant.resumeUrlSnapshot ?? applicant.jobSeekerProfile.resumeUrl ?? ""}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm text-brand-800 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
                  >
                    <FileText className="h-4 w-4 shrink-0" aria-hidden />
                    Download CV
                  </a>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No CV on file.</p>
                )}
                <form
                  action={updateApplicationStatusAction.bind(null, organizationId, jobId, applicant.id)}
                  className="flex items-center gap-2"
                >
                  <Select name="status" defaultValue={applicant.status} className="w-48">
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" size="sm" variant="outline">
                    Update status
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
