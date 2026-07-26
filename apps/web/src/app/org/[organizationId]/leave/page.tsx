import { LEAVE_TYPE_LABELS, type LeaveRequestStatus, type LeaveType } from "@eaglehr/types";
import Link from "next/link";
import { LeaveStatusBadge } from "@/components/leave-status-badge";
import { apiFetch } from "@/lib/api";

interface OrgLeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: LeaveRequestStatus;
  employee: { id: string; firstName: string; lastName: string };
}

interface LeavePageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function LeavePage({ params }: LeavePageProps) {
  const { organizationId } = await params;
  const leaveRequests = await apiFetch<OrgLeaveRequest[]>(`/organizations/${organizationId}/leave-requests`);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Leave requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Across all employees in your organization.</p>
      </div>

      {leaveRequests.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {leaveRequests.map((leaveRequest) => (
            <Link
              key={leaveRequest.id}
              href={`/org/${organizationId}/employees/${leaveRequest.employee.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-brand-50 dark:hover:bg-gray-900"
            >
              <div>
                <p className="font-medium">
                  {leaveRequest.employee.firstName} {leaveRequest.employee.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {LEAVE_TYPE_LABELS[leaveRequest.type]} · {new Date(leaveRequest.startDate).toLocaleDateString()} –{" "}
                  {new Date(leaveRequest.endDate).toLocaleDateString()} ({leaveRequest.daysRequested} day
                  {leaveRequest.daysRequested === 1 ? "" : "s"})
                </p>
              </div>
              <LeaveStatusBadge status={leaveRequest.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
