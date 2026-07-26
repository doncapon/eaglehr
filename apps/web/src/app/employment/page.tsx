import { LEAVE_TYPE_LABELS, type EmployeeStatus, type LeaveRequestStatus, type LeaveType } from "@eaglehr/types";
import { redirect } from "next/navigation";
import { EmployeeStatusBadge } from "@/components/employee-status-badge";
import { LeaveStatusBadge } from "@/components/leave-status-badge";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, getMyEmployeeRecords } from "@/lib/session";
import { CancelLeaveRequestButton } from "./cancel-leave-request-button";
import { LeaveRequestForm } from "./leave-request-form";

interface MyLeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string | null;
  status: LeaveRequestStatus;
}

export default async function EmploymentPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const employeeRecords = await getMyEmployeeRecords();
  if (employeeRecords.length === 0) {
    redirect("/dashboard");
  }

  const employeesWithLeaveRequests = await Promise.all(
    employeeRecords.map(async (employee) => ({
      employee,
      leaveRequests: await apiFetch<MyLeaveRequest[]>(`/me/employee-records/${employee.id}/leave-requests`).catch(
        () => [] as MyLeaveRequest[],
      ),
    })),
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">My employment</h1>

      {employeesWithLeaveRequests.map(({ employee, leaveRequests }) => (
        <div key={employee.id} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{employee.organization.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</p>
            </div>
            <EmployeeStatusBadge status={employee.status as EmployeeStatus} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Request leave</h2>
            <LeaveRequestForm employeeId={employee.id} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Leave requests</h2>
            {leaveRequests.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {leaveRequests.map((leaveRequest) => (
                  <li key={leaveRequest.id} className="flex flex-col gap-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {LEAVE_TYPE_LABELS[leaveRequest.type]} · {new Date(leaveRequest.startDate).toLocaleDateString()}{" "}
                        – {new Date(leaveRequest.endDate).toLocaleDateString()} ({leaveRequest.daysRequested} day
                        {leaveRequest.daysRequested === 1 ? "" : "s"})
                      </p>
                      <LeaveStatusBadge status={leaveRequest.status} />
                    </div>
                    {leaveRequest.reason ? <p className="text-gray-700 dark:text-gray-300">{leaveRequest.reason}</p> : null}
                    {leaveRequest.status === "PENDING" ? (
                      <CancelLeaveRequestButton employeeId={employee.id} leaveRequestId={leaveRequest.id} />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
