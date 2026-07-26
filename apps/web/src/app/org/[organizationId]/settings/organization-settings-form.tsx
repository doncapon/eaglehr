"use client";

import { NIGERIA_STATE_LABELS, NIGERIA_STATES, ORG_INDUSTRIES, ORG_SIZE_LABELS, ORG_SIZES } from "@eaglehr/types";
import { Button, Input, Label, Select } from "@eaglehr/ui";
import { useActionState, useState, type ChangeEvent } from "react";
import { updateOrganizationAction } from "@/lib/organization-actions";

interface OrganizationSettingsFormProps {
  organizationId: string;
  organization: {
    name: string;
    industry: string | null;
    size: string | null;
    websiteUrl: string | null;
    rcNumber: string | null;
    addressLine: string | null;
    city: string | null;
    state: string | null;
    contactPersonName: string | null;
    contactPersonPhone: string | null;
    taxId: string | null;
    foundingYear: number | null;
  };
}

export function OrganizationSettingsForm({ organizationId, organization }: OrganizationSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateOrganizationAction.bind(null, organizationId),
    undefined,
  );
  const [values, setValues] = useState({
    name: organization.name,
    industry: organization.industry ?? "",
    size: organization.size ?? "",
    websiteUrl: organization.websiteUrl ?? "",
    rcNumber: organization.rcNumber ?? "",
    addressLine: organization.addressLine ?? "",
    city: organization.city ?? "",
    state: organization.state ?? "",
    contactPersonName: organization.contactPersonName ?? "",
    contactPersonPhone: organization.contactPersonPhone ?? "",
    taxId: organization.taxId ?? "",
    foundingYear: organization.foundingYear ? String(organization.foundingYear) : "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
        <h2 className="col-span-full font-semibold">Company</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" value={values.name} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">Industry</Label>
          <Select id="industry" name="industry" value={values.industry} onChange={handleChange}>
            <option value="">Not specified</option>
            {ORG_INDUSTRIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="size">Company size</Label>
          <Select id="size" name="size" value={values.size} onChange={handleChange}>
            <option value="">Not specified</option>
            {ORG_SIZES.map((option) => (
              <option key={option} value={option}>
                {ORG_SIZE_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" name="websiteUrl" type="url" value={values.websiteUrl} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rcNumber">CAC/RC number</Label>
          <Input id="rcNumber" name="rcNumber" value={values.rcNumber} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foundingYear">Founding year</Label>
          <Input
            id="foundingYear"
            name="foundingYear"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={values.foundingYear}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
        <h2 className="col-span-full font-semibold">Address &amp; contact</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addressLine">Office address</Label>
          <Input id="addressLine" name="addressLine" value={values.addressLine} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={values.city} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Select id="state" name="state" value={values.state} onChange={handleChange}>
            <option value="">Not specified</option>
            {NIGERIA_STATES.map((option) => (
              <option key={option} value={option}>
                {NIGERIA_STATE_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="taxId">Tax ID (TIN)</Label>
          <Input id="taxId" name="taxId" value={values.taxId} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPersonName">Primary contact name</Label>
          <Input id="contactPersonName" name="contactPersonName" value={values.contactPersonName} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPersonPhone">Primary contact phone</Label>
          <Input
            id="contactPersonPhone"
            name="contactPersonPhone"
            value={values.contactPersonPhone}
            onChange={handleChange}
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      {state?.success ? <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p> : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
