import { EMPLOYEE_DOCUMENT_TYPE_LABELS, LEAVE_TYPE_LABELS, type EmployeeDocumentType, type LeaveRequestStatus, type LeaveType } from "@eaglehr/types";
import { FileText } from "lucide-react";
import { LeaveStatusBadge } from "@/components/leave-status-badge";
import { apiFetch } from "@/lib/api";
import { updateEmployeeAction } from "@/lib/employee-actions";
import { emptyEmployeeFormValues, EmployeeForm, type EmployeeFormValues } from "../employee-form";
import { EmployeeDocumentForm } from "./employee-document-form";
import { EmployeeNoteForm } from "./employee-note-form";
import { LeaveRequestReviewForm } from "./leave-request-review-form";
import { OnboardingInviteButton } from "./onboarding-invite-button";

interface EmployeeDetail {
  id: string;
  userId: string | null;
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
  onboardingTokenExpiresAt: string | null;
  documents: { id: string; type: EmployeeDocumentType; uploadedAt: string }[];
  notes: { id: string; body: string; createdAt: string; author: { firstName: string; lastName: string } }[];
  leaveRequests: {
    id: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    daysRequested: number;
    reason: string | null;
    status: LeaveRequestStatus;
    reviewNote: string | null;
    requestedBy: { firstName: string; lastName: string };
    reviewedBy: { firstName: string; lastName: string } | null;
  }[];
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
    leaveBalanceDays: String(employee.leaveBalanceDays),
  };

  const personalDetailRows: [string, string | null][] = [
    ["Date of birth", employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null],
    ["Gender", employee.gender],
    ["Marital status", employee.maritalStatus],
    ["Address", employee.addressLine],
    ["Emergency contact", employee.emergencyContactName && employee.emergencyContactPhone
      ? `${employee.emergencyContactName} (${employee.emergencyContactRelationship ?? "relationship not given"}) · ${employee.emergencyContactPhone}`
      : null],
    ["Next of kin", employee.nextOfKinName
      ? `${employee.nextOfKinName} (${employee.nextOfKinRelationship ?? "relationship not given"}) · ${employee.nextOfKinPhone ?? "no phone"}`
      : null],
    ["Bank details", employee.bankName
      ? `${employee.bankName} · ${employee.bankAccountNumber ?? "no account number"} · ${employee.bankAccountName ?? ""}`
      : null],
    ["Tax ID", employee.taxId],
  ];
  const hasAnyPersonalDetail = personalDetailRows.some(([, value]) => value);

  const onboardingInviteExpired = employee.onboardingTokenExpiresAt
    ? new Date(employee.onboardingTokenExpiresAt) < new Date()
    : false;
  const onboardingInvitePending = Boolean(employee.onboardingTokenExpiresAt) && !onboardingInviteExpired;

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
        <h2 className="font-semibold">Onboarding</h2>
        {employee.userId ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Linked to an EagleHire account — this employee can log in and manage their own leave requests.
          </p>
        ) : onboardingInvitePending ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Invite sent to {employee.email} — awaiting completion.
            </p>
            <OnboardingInviteButton organizationId={organizationId} employeeId={employeeId} label="Resend invite" />
          </div>
        ) : !employee.email ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add an email address above and save, then you can invite this employee to fill in their own profile.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {onboardingInviteExpired
                ? "The previous invite expired."
                : "This employee hasn't been invited to complete their profile yet."}
            </p>
            <OnboardingInviteButton organizationId={organizationId} employeeId={employeeId} label="Send onboarding invite" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-semibold">Personal details</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Filled in by the employee themselves — read-only here.
        </p>
        {hasAnyPersonalDetail ? (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {personalDetailRows
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{value}</dd>
                </div>
              ))}
          </dl>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Not filled in yet.</p>
        )}
      </div>

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

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-semibold">Leave requests</h2>
        {employee.leaveRequests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {employee.leaveRequests.map((leaveRequest) => (
              <li key={leaveRequest.id} className="flex flex-col gap-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {LEAVE_TYPE_LABELS[leaveRequest.type]} · {new Date(leaveRequest.startDate).toLocaleDateString()} –{" "}
                    {new Date(leaveRequest.endDate).toLocaleDateString()} ({leaveRequest.daysRequested} day
                    {leaveRequest.daysRequested === 1 ? "" : "s"})
                  </p>
                  <LeaveStatusBadge status={leaveRequest.status} />
                </div>
                {leaveRequest.reason ? <p className="text-gray-700 dark:text-gray-300">{leaveRequest.reason}</p> : null}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Requested by {leaveRequest.requestedBy.firstName} {leaveRequest.requestedBy.lastName}
                  {leaveRequest.reviewedBy
                    ? ` · Reviewed by ${leaveRequest.reviewedBy.firstName} ${leaveRequest.reviewedBy.lastName}`
                    : ""}
                </p>
                {leaveRequest.reviewNote ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Note: {leaveRequest.reviewNote}</p>
                ) : null}
                {leaveRequest.status === "PENDING" ? (
                  <LeaveRequestReviewForm
                    organizationId={organizationId}
                    employeeId={employeeId}
                    leaveRequestId={leaveRequest.id}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
