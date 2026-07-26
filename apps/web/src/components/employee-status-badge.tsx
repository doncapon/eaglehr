import { EMPLOYEE_STATUS_LABELS, type EmployeeStatus } from "@eaglehr/types";
import { Badge } from "@eaglehr/ui";

const VARIANTS: Record<EmployeeStatus, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  TERMINATED: "destructive",
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge variant={VARIANTS[status]}>{EMPLOYEE_STATUS_LABELS[status]}</Badge>;
}
