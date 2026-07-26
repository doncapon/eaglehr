"use client";

import { GENDERS, MARITAL_STATUSES, NIGERIA_STATE_LABELS, NIGERIA_STATES } from "@eaglehr/types";
import { Button, Input, Label, Select, Textarea } from "@eaglehr/ui";
import { useActionState } from "react";
import { PasswordInput } from "@/components/password-input";
import { completeEmployeeOnboardingAction } from "@/lib/employee-onboarding-actions";

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

export function CompleteOnboardingForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(completeEmployeeOnboardingAction.bind(null, token), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Section title="Your account">
        <Field id="password" label="Password">
          <PasswordInput id="password" name="password" required autoComplete="new-password" />
        </Field>
        <Field id="confirmPassword" label="Confirm password">
          <PasswordInput id="confirmPassword" name="confirmPassword" required autoComplete="new-password" />
        </Field>
        <p className="text-xs text-gray-500 dark:text-gray-400 sm:col-span-2">
          If you already have an EagleHire account with this email, enter its password to link this employee record to
          it instead of creating a new one.
        </p>
      </Section>

      <Section title="Personal">
        <Field id="phone" label="Phone">
          <Input id="phone" name="phone" />
        </Field>
        <Field id="dateOfBirth" label="Date of birth">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" />
        </Field>
        <Field id="gender" label="Gender">
          <Select id="gender" name="gender" defaultValue="">
            <option value="">Not specified</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="maritalStatus" label="Marital status">
          <Select id="maritalStatus" name="maritalStatus" defaultValue="">
            <option value="">Not specified</option>
            {MARITAL_STATUSES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="addressLine" label="Address">
          <Input id="addressLine" name="addressLine" />
        </Field>
        <Field id="city" label="City">
          <Input id="city" name="city" />
        </Field>
        <Field id="state" label="State">
          <Select id="state" name="state" defaultValue="">
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
          <Input id="emergencyContactName" name="emergencyContactName" />
        </Field>
        <Field id="emergencyContactPhone" label="Phone">
          <Input id="emergencyContactPhone" name="emergencyContactPhone" />
        </Field>
        <Field id="emergencyContactRelationship" label="Relationship">
          <Input id="emergencyContactRelationship" name="emergencyContactRelationship" />
        </Field>
      </Section>

      <Section title="Next of kin">
        <Field id="nextOfKinName" label="Name">
          <Input id="nextOfKinName" name="nextOfKinName" />
        </Field>
        <Field id="nextOfKinPhone" label="Phone">
          <Input id="nextOfKinPhone" name="nextOfKinPhone" />
        </Field>
        <Field id="nextOfKinRelationship" label="Relationship">
          <Input id="nextOfKinRelationship" name="nextOfKinRelationship" />
        </Field>
        <Field id="nextOfKinAddress" label="Address">
          <Textarea id="nextOfKinAddress" name="nextOfKinAddress" rows={2} />
        </Field>
      </Section>

      <Section title="Bank details">
        <Field id="bankName" label="Bank name">
          <Input id="bankName" name="bankName" />
        </Field>
        <Field id="bankAccountNumber" label="Account number">
          <Input id="bankAccountNumber" name="bankAccountNumber" />
        </Field>
        <Field id="bankAccountName" label="Account name">
          <Input id="bankAccountName" name="bankAccountName" />
        </Field>
        <Field id="taxId" label="Tax ID (TIN)">
          <Input id="taxId" name="taxId" />
        </Field>
      </Section>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Complete my profile"}
      </Button>
    </form>
  );
}
