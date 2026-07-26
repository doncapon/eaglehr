import { apiFetch } from "@/lib/api";
import { createEmployeeAction } from "@/lib/employee-actions";
import { emptyEmployeeFormValues, EmployeeForm } from "../employee-form";

interface Prefill {
  applicationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  jobTitle: string;
}

interface ManagerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface NewEmployeePageProps {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function NewEmployeePage({ params, searchParams }: NewEmployeePageProps) {
  const { organizationId } = await params;
  const { applicationId } = await searchParams;

  const [prefill, managers] = await Promise.all([
    applicationId
      ? apiFetch<Prefill>(`/organizations/${organizationId}/employees/from-application/${applicationId}/prefill`)
      : null,
    apiFetch<ManagerOption[]>(`/organizations/${organizationId}/employees`),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Add employee</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {prefill
            ? "Review the details below, then save to create the employee record."
            : "Record a staff member who wasn't hired through this platform."}
        </p>
      </div>

      <EmployeeForm
        action={createEmployeeAction.bind(null, organizationId)}
        applicationId={prefill?.applicationId}
        managers={managers}
        showStatus={false}
        submitLabel="Add employee"
        defaultValues={{
          ...emptyEmployeeFormValues,
          firstName: prefill?.firstName ?? "",
          lastName: prefill?.lastName ?? "",
          email: prefill?.email ?? "",
          phone: prefill?.phone ?? "",
          city: prefill?.city ?? "",
          state: prefill?.state ?? "",
          jobTitle: prefill?.jobTitle ?? "",
        }}
      />
    </div>
  );
}
