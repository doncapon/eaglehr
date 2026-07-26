import { Button } from "@eaglehr/ui";
import Link from "next/link";
import { EmployeeStatusBadge } from "@/components/employee-status-badge";
import { apiFetch } from "@/lib/api";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string | null;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  employmentType: string;
}

interface EmployeesPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function EmployeesPage({ params }: EmployeesPageProps) {
  const { organizationId } = await params;
  const employees = await apiFetch<Employee[]>(`/organizations/${organizationId}/employees`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employees ({employees.length})</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your organization's HR records.</p>
        </div>
        <Link href={`/org/${organizationId}/employees/new`}>
          <Button>Add employee</Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No employees on file yet. Convert a hired applicant, or add one manually.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {employees.map((employee) => (
            <Link
              key={employee.id}
              href={`/org/${organizationId}/employees/${employee.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-brand-50 dark:hover:bg-gray-900"
            >
              <div>
                <p className="font-medium">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {employee.jobTitle}
                  {employee.department ? ` · ${employee.department}` : ""}
                </p>
              </div>
              <EmployeeStatusBadge status={employee.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
