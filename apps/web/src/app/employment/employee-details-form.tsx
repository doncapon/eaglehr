"use client";

import { GENDERS, MARITAL_STATUSES, NIGERIA_STATE_LABELS, NIGERIA_STATES } from "@eaglehr/types";
import { Button, Input, Label, Select, Textarea } from "@eaglehr/ui";
import { useActionState, useState, type ChangeEvent } from "react";
import { updateMyEmployeeDetailsAction } from "@/lib/employee-details-actions";
import type { MyEmployeeRecordSummary } from "@/lib/session";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="font-semibold">{title}</h3>
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

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

type EmployeeDetails = Pick<
  MyEmployeeRecordSummary,
  | "phone"
  | "dateOfBirth"
  | "gender"
  | "maritalStatus"
  | "addressLine"
  | "city"
  | "state"
  | "emergencyContactName"
  | "emergencyContactPhone"
  | "emergencyContactRelationship"
  | "nextOfKinName"
  | "nextOfKinPhone"
  | "nextOfKinRelationship"
  | "nextOfKinAddress"
  | "bankName"
  | "bankAccountNumber"
  | "bankAccountName"
  | "taxId"
>;

interface FormValues {
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  addressLine: string;
  city: string;
  state: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  nextOfKinAddress: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  taxId: string;
}

function toFormValues(employee: EmployeeDetails): FormValues {
  return {
    phone: employee.phone ?? "",
    dateOfBirth: toDateInputValue(employee.dateOfBirth),
    gender: employee.gender ?? "",
    maritalStatus: employee.maritalStatus ?? "",
    addressLine: employee.addressLine ?? "",
    city: employee.city ?? "",
    state: employee.state ?? "",
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
  };
}

export function EmployeeDetailsForm({ employeeId, employee }: { employeeId: string; employee: EmployeeDetails }) {
  const [state, formAction, isPending] = useActionState(updateMyEmployeeDetailsAction.bind(null, employeeId), undefined);
  const [values, setValues] = useState<FormValues>(toFormValues(employee));

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Section title="Personal">
        <Field id="phone" label="Phone">
          <Input id="phone" name="phone" value={values.phone} onChange={handleChange} />
        </Field>
        <Field id="dateOfBirth" label="Date of birth">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" value={values.dateOfBirth} onChange={handleChange} />
        </Field>
        <Field id="gender" label="Gender">
          <Select id="gender" name="gender" value={values.gender} onChange={handleChange}>
            <option value="">Not specified</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="maritalStatus" label="Marital status">
          <Select id="maritalStatus" name="maritalStatus" value={values.maritalStatus} onChange={handleChange}>
            <option value="">Not specified</option>
            {MARITAL_STATUSES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="addressLine" label="Address">
          <Input id="addressLine" name="addressLine" value={values.addressLine} onChange={handleChange} />
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
      </Section>

      <Section title="Emergency contact">
        <Field id="emergencyContactName" label="Name">
          <Input id="emergencyContactName" name="emergencyContactName" value={values.emergencyContactName} onChange={handleChange} />
        </Field>
        <Field id="emergencyContactPhone" label="Phone">
          <Input id="emergencyContactPhone" name="emergencyContactPhone" value={values.emergencyContactPhone} onChange={handleChange} />
        </Field>
        <Field id="emergencyContactRelationship" label="Relationship">
          <Input
            id="emergencyContactRelationship"
            name="emergencyContactRelationship"
            value={values.emergencyContactRelationship}
            onChange={handleChange}
          />
        </Field>
      </Section>

      <Section title="Next of kin">
        <Field id="nextOfKinName" label="Name">
          <Input id="nextOfKinName" name="nextOfKinName" value={values.nextOfKinName} onChange={handleChange} />
        </Field>
        <Field id="nextOfKinPhone" label="Phone">
          <Input id="nextOfKinPhone" name="nextOfKinPhone" value={values.nextOfKinPhone} onChange={handleChange} />
        </Field>
        <Field id="nextOfKinRelationship" label="Relationship">
          <Input id="nextOfKinRelationship" name="nextOfKinRelationship" value={values.nextOfKinRelationship} onChange={handleChange} />
        </Field>
        <Field id="nextOfKinAddress" label="Address">
          <Textarea id="nextOfKinAddress" name="nextOfKinAddress" value={values.nextOfKinAddress} onChange={handleChange} rows={2} />
        </Field>
      </Section>

      <Section title="Bank details">
        <Field id="bankName" label="Bank name">
          <Input id="bankName" name="bankName" value={values.bankName} onChange={handleChange} />
        </Field>
        <Field id="bankAccountNumber" label="Account number">
          <Input id="bankAccountNumber" name="bankAccountNumber" value={values.bankAccountNumber} onChange={handleChange} />
        </Field>
        <Field id="bankAccountName" label="Account name">
          <Input id="bankAccountName" name="bankAccountName" value={values.bankAccountName} onChange={handleChange} />
        </Field>
        <Field id="taxId" label="Tax ID (TIN)">
          <Input id="taxId" name="taxId" value={values.taxId} onChange={handleChange} />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : "Save my details"}
        </Button>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
      </div>
    </form>
  );
}
