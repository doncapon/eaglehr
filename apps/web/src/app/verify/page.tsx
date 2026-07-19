import { redirect } from "next/navigation";
import { FadeInUp } from "@/components/animated";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, getMyOrganizations } from "@/lib/session";
import { CompanyVerificationCard } from "./company-verification-card";
import { JobSeekerVerificationForm } from "./job-seeker-verification-form";

interface OrganizationDetail {
  id: string;
  name: string;
  rcNumber: string | null;
  verificationStatus: string;
  verificationNote: string | null;
  verificationDocuments: { type: string }[];
}

interface JobSeekerProfileDetail {
  nin: string | null;
  idDocumentUrl: string | null;
  verificationStatus: string;
  verificationNote: string | null;
}

export default async function VerifyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organizations = await getMyOrganizations();
  const isEmployer = organizations.length > 0;

  const organizationDetails = isEmployer
    ? await Promise.all(organizations.map((org) => apiFetch<OrganizationDetail>(`/organizations/${org.id}`)))
    : [];

  const profile = isEmployer ? null : await apiFetch<JobSeekerProfileDetail | null>("/me/profile");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <FadeInUp>
        <h1 className="text-2xl font-bold">Verification</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verified accounts get a trust badge and stand out to {isEmployer ? "candidates" : "employers"}.
        </p>
      </FadeInUp>

      <EmailVerificationBanner isVerified={user.isEmailVerified} />

      {isEmployer ? (
        <div className="flex flex-col gap-5">
          {organizationDetails.map((organization) => (
            <CompanyVerificationCard key={organization.id} organization={organization} />
          ))}
        </div>
      ) : (
        <JobSeekerVerificationForm
          verificationStatus={profile?.verificationStatus ?? "UNVERIFIED"}
          verificationNote={profile?.verificationNote ?? null}
          nin={profile?.nin ?? null}
          hasDocument={Boolean(profile?.idDocumentUrl)}
        />
      )}
    </div>
  );
}
