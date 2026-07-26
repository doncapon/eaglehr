"use client";

import { EMPLOYEE_STATUSES, EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPES, NIGERIA_STATE_LABELS, NIGERIA_STATES } from "@eaglehr/types";
import { Button, Input, Label, Select } from "@eaglehr/ui";
import { useActionState, useState, type ChangeEvent } from "react";
import type { ActionState } from "@/lib/organization-actions";

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  // Only carried over (and only shown) when converting a hired application — the
  // applicant already gave us these, so it isn't HR entering someone else's details.
  phone: string;
  city: string;
  state: string;
  employeeNumber: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  managerId: string;
  status: string;
  endDate: string;
  leaveBalanceDays: string;
}

export const emptyEmployeeFormValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  employeeNumber: "",
  department: "",
  jobTitle: "",
  employmentType: "",
  startDate: "",
  managerId: "",
  status: "ACTIVE",
  endDate: "",
  leaveBalanceDays: "",
};

interface EmployeeFormProps {
  action: (state: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  defaultValues: EmployeeFormValues;
  applicationId?: string;
  managers: { id: string; firstName: string; lastName: string }[];
  showStatus: boolean;
  submitLabel: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function EmployeeForm({ action, defaultValues, applicationId, managers, showStatus, submitLabel }: EmployeeFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  // Controlled so a failed submission doesn't wipe out everything typed —
  // React resets uncontrolled inputs after a form action runs.
  const [values, setValues] = useState<EmployeeFormValues>(defaultValues);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {applicationId ? <input type="hidden" name="applicationId" value={applicationId} /> : null}

      <Section title="Personal">
        <Field id="firstName" label="First name">
          <Input id="firstName" name="firstName" value={values.firstName} onChange={handleChange} required />
        </Field>
        <Field id="lastName" label="Last name">
          <Input id="lastName" name="lastName" value={values.lastName} onChange={handleChange} required />
        </Field>
        <Field id="email" label="Email">
          <Input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
        </Field>
        {applicationId ? (
          <>
            <Field id="phone" label="Phone">
              <Input id="phone" name="phone" value={values.phone} onChange={handleChange} />
            </Field>
            <Field id="city" label="City">
              <Input id="city" name="city" value={values.city} onChange={handleChange} />
            </Field>
            <Field id="state" label="State">
              <Select id="state" name="state" value={values.state} onChange={handleChange}>
                <option value="">Not specified</option>
                {NIGERIA_STATES.map((s) => (
                  <option key={s} value={s}>
                    {NIGERIA_STATE_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}
      </Section>
      {!applicationId ? (
        <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
          Address, emergency contact, next of kin, and bank details are filled in by the employee themselves — send them
          an onboarding invite once this record is saved.
        </p>
      ) : null}

      <Section title="Employment">
        <Field id="jobTitle" label="Job title">
          <Input id="jobTitle" name="jobTitle" value={values.jobTitle} onChange={handleChange} required />
        </Field>
        <Field id="department" label="Department">
          <Input id="department" name="department" value={values.department} onChange={handleChange} />
        </Field>
        <Field id="employmentType" label="Employment type">
          <Select id="employmentType" name="employmentType" value={values.employmentType} onChange={handleChange} required>
            <option value="" disabled>
              Select...
            </option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="employeeNumber" label="Employee number (optional)">
          <Input id="employeeNumber" name="employeeNumber" value={values.employeeNumber} onChange={handleChange} />
        </Field>
        <Field id="startDate" label="Start date">
          <Input id="startDate" name="startDate" type="date" value={values.startDate} onChange={handleChange} required />
        </Field>
        <Field id="managerId" label="Manager">
          <Select id="managerId" name="managerId" value={values.managerId} onChange={handleChange}>
            <option value="">No manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </Select>
        </Field>
        {showStatus ? (
          <>
            <Field id="status" label="Status">
              <Select id="status" name="status" value={values.status} onChange={handleChange}>
                {EMPLOYEE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {EMPLOYEE_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="endDate" label="End date (if terminated)">
              <Input id="endDate" name="endDate" type="date" value={values.endDate} onChange={handleChange} />
            </Field>
          </>
        ) : null}
      </Section>

      <Section title="Leave">
        <Field id="leaveBalanceDays" label="Leave balance (days)">
          <Input
            id="leaveBalanceDays"
            name="leaveBalanceDays"
            type="number"
            min={0}
            value={values.leaveBalanceDays}
            onChange={handleChange}
          />
        </Field>
      </Section>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p> : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
