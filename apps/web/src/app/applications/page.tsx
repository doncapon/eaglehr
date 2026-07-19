import { Badge, type BadgeProps } from "@eaglehr/ui";
import Link from "next/link";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animated";
import { apiFetch } from "@/lib/api";

interface MyApplication {
  id: string;
  status: string;
  job: { title: string; slug: string; organization: { name: string } };
}

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  APPLIED: "secondary",
  SHORTLISTED: "default",
  INTERVIEWING: "warning",
  OFFERED: "success",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

export default async function MyApplicationsPage() {
  const applications = await apiFetch<MyApplication[]>("/me/applications");

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <h1 className="text-2xl font-bold">My applications</h1>
      </FadeInUp>
      {applications.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t applied to any jobs yet.</p>
      ) : (
        <StaggerContainer className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {applications.map((application) => (
            <StaggerItem key={application.id}>
              <Link
                href={`/jobs/${application.job.slug}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-brand-50 dark:hover:bg-gray-900"
              >
                <div>
                  <p className="font-medium">{application.job.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{application.job.organization.name}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[application.status] ?? "secondary"}>{application.status}</Badge>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
