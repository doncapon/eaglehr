import { EMPLOYEE_DOCUMENT_TYPE_LABELS, type EmployeeDocumentType } from "@eaglehr/types";
import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { updateEmployeeAction } from "@/lib/employee-actions";
import { emptyEmployeeFormValues, EmployeeForm, type EmployeeFormValues } from "../employee-form";
import { EmployeeDocumentForm } from "./employee-document-form";
import { EmployeeNoteForm } from "./employee-note-form";

interface EmployeeDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  employeeNumber: string | null;
  department: string | null;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  status: string;
  managerId: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelationship: string | null;
  nextOfKinAddress: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  taxId: string | null;
  leaveBalanceDays: number;
  documents: { id: string; type: EmployeeDocumentType; uploadedAt: string }[];
  notes: { id: string; body: string; createdAt: string; author: { firstName: string; lastName: string } }[];
}

interface ManagerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface EmployeeDetailPageProps {
  params: Promise<{ organizationId: string; employeeId: string }>;
}

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { organizationId, employeeId } = await params;

  const [employee, allEmployees] = await Promise.all([
    apiFetch<EmployeeDetail>(`/organizations/${organizationId}/employees/${employeeId}`),
    apiFetch<ManagerOption[]>(`/organizations/${organizationId}/employees`),
  ]);
  const managers = allEmployees.filter((candidate) => candidate.id !== employeeId);

  const defaultValues: EmployeeFormValues = {
    ...emptyEmployeeFormValues,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    dateOfBirth: toDateInputValue(employee.dateOfBirth),
    gender: employee.gender ?? "",
    maritalStatus: employee.maritalStatus ?? "",
    addressLine: employee.addressLine ?? "",
    city: employee.city ?? "",
    state: employee.state ?? "",
    employeeNumber: employee.employeeNumber ?? "",
    department: employee.department ?? "",
    jobTitle: employee.jobTitle,
    employmentType: employee.employmentType,
    startDate: toDateInputValue(employee.startDate),
    managerId: employee.managerId ?? "",
    status: employee.status,
    endDate: toDateInputValue(employee.endDate),
    emergencyContactName: employee.emergencyContactName ?? "",
    emergencyContactPhone: employee.emergencyContactPhone ?? "",
    emergencyContactRelationship: employee.emergencyContactRelationship ?? "",
    nextOfKinName: employee.nextOfKinName ?? "",
    nextOfKinPhone: employee.nextOfKinPhone ?? "",
    nextOfKinRelationship: employee.nextOfKinRelationship ?? "",
    nextOfKinAddress: employee.nextOfKinAddress ?? "",
    bankName: employee.bankName ?? "",
    bankAccountNumber: employee.bankAccountNumber ?? "",
    bankAccountName: employee.bankAccountName ?? "",
    taxId: employee.taxId ?? "",
    leaveBalanceDays: String(employee.leaveBalanceDays),
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">
          {employee.firstName} {employee.lastName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</p>
      </div>

      <EmployeeForm
        action={updateEmployeeAction.bind(null, organizationId, employeeId)}
        defaultValues={defaultValues}
        managers={managers}
        showStatus
        submitLabel="Save changes"
      />

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-semibold">Documents</h2>
        {employee.documents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {employee.documents.map((document) => (
              <li key={document.id}>
                <a
                  href={`/api/employees/${organizationId}/${employeeId}/${document.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden />
                  {EMPLOYEE_DOCUMENT_TYPE_LABELS[document.type]} — {new Date(document.uploadedAt).toLocaleDateString()}
                </a>
              </li>
            ))}
          </ul>
        )}
        <EmployeeDocumentForm organizationId={organizationId} employeeId={employeeId} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-semibold">Notes</h2>
        {employee.notes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {employee.notes.map((note) => (
              <li key={note.id} className="text-sm">
                <p className="text-gray-700 dark:text-gray-300">{note.body}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {note.author.firstName} {note.author.lastName} · {new Date(note.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <EmployeeNoteForm organizationId={organizationId} employeeId={employeeId} />
      </div>
    </div>
  );
}
