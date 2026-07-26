"use client";

import { EMPLOYEE_DOCUMENT_TYPES, EMPLOYEE_DOCUMENT_TYPE_LABELS } from "@eaglehr/types";
import { Button, Select } from "@eaglehr/ui";
import { useActionState } from "react";
import { uploadEmployeeDocumentAction } from "@/lib/employee-actions";

export function EmployeeDocumentForm({ organizationId, employeeId }: { organizationId: string; employeeId: string }) {
  const [state, formAction, isPending] = useActionState(
    uploadEmployeeDocumentAction.bind(null, organizationId, employeeId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Select name="type" defaultValue="OTHER" className="w-40">
        {EMPLOYEE_DOCUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {EMPLOYEE_DOCUMENT_TYPE_LABELS[type]}
          </option>
        ))}
      </Select>
      <input
        type="file"
        name="file"
        required
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-brand-700 dark:text-gray-300"
      />
      <Button type="submit" size="sm" disabled={isPending} className="w-fit">
        {isPending ? "Uploading..." : "Upload"}
      </Button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
