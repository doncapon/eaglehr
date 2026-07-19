import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { JobSeekerReviewCard } from "./job-seeker-review-card";
import { OrganizationReviewCard } from "./organization-review-card";

interface PendingJobSeeker {
  id: string;
  nin: string | null;
  user: { firstName: string; lastName: string; email: string };
}

interface PendingOrganization {
  id: string;
  name: string;
  rcNumber: string | null;
  verificationDocuments: { type: string }[];
}

export default async function AdminVerificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.isPlatformAdmin) {
    redirect("/dashboard");
  }

  const [jobSeekers, organizations] = await Promise.all([
    apiFetch<PendingJobSeeker[]>("/admin/verifications/job-seekers?status=PENDING"),
    apiFetch<PendingOrganization[]>("/admin/verifications/organizations?status=PENDING"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Verification requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review pending job seeker and company verifications.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Job seekers ({jobSeekers.length})</h2>
        {jobSeekers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No pending job seeker verifications.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {jobSeekers.map((profile) => (
              <JobSeekerReviewCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Companies ({organizations.length})</h2>
        {organizations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No pending company verifications.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {organizations.map((organization) => (
              <OrganizationReviewCard key={organization.id} organization={organization} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
