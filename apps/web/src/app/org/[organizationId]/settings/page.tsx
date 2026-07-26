import { apiFetch } from "@/lib/api";
import { OrganizationSettingsForm } from "./organization-settings-form";

interface OrganizationDetail {
  name: string;
  industry: string | null;
  size: string | null;
  websiteUrl: string | null;
  rcNumber: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  contactPersonName: string | null;
  contactPersonPhone: string | null;
  taxId: string | null;
  foundingYear: number | null;
}

interface SettingsPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationSettingsPage({ params }: SettingsPageProps) {
  const { organizationId } = await params;
  const organization = await apiFetch<OrganizationDetail>(`/organizations/${organizationId}`);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Company profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Keep your company's details up to date.</p>
      </div>
      <OrganizationSettingsForm organizationId={organizationId} organization={organization} />
    </div>
  );
}
