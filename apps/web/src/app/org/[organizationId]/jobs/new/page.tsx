"use client";

import { Button, Input, Label, Select, Textarea } from "@eaglehr/ui";
import { EMPLOYMENT_TYPES, NIGERIA_STATE_LABELS, NIGERIA_STATES, WORK_MODES } from "@eaglehr/types";
import { use, useActionState, useState, type ChangeEvent } from "react";
import { SalaryInputGroup } from "@/components/salary-input-group";
import { createJobAction } from "@/lib/job-actions";

interface NewJobPageProps {
  params: Promise<{ organizationId: string }>;
}

interface FormValues {
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  employmentType: string;
  workMode: string;
  state: string;
  city: string;
}

const initialValues: FormValues = {
  title: "",
  description: "",
  responsibilities: "",
  requirements: "",
  employmentType: "",
  workMode: "",
  state: "",
  city: "",
};

export default function NewJobPage({ params }: NewJobPageProps) {
  const { organizationId } = use(params);
  const [state, formAction, isPending] = useActionState(createJobAction.bind(null, organizationId), undefined);
  // Controlled so a failed submission (e.g. a validation error from the server) doesn't wipe
  // out everything the user typed — React resets uncontrolled inputs after a form action runs.
  const [values, setValues] = useState<FormValues>(initialValues);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Post a job</h1>
      <form action={formAction} className="flex max-w-2xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Job title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Backend Engineer"
            value={values.title}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            value={values.description}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="responsibilities">Responsibilities (optional)</Label>
          <Textarea
            id="responsibilities"
            name="responsibilities"
            rows={4}
            value={values.responsibilities}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requirements">Requirements (optional)</Label>
          <Textarea
            id="requirements"
            name="requirements"
            rows={4}
            value={values.requirements}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employmentType">Employment type</Label>
            <Select id="employmentType" name="employmentType" required value={values.employmentType} onChange={handleChange}>
              <option value="" disabled>
                Select...
              </option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workMode">Work mode</Label>
            <Select id="workMode" name="workMode" required value={values.workMode} onChange={handleChange}>
              <option value="" disabled>
                Select...
              </option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">State</Label>
            <Select id="state" name="state" required value={values.state} onChange={handleChange}>
              <option value="" disabled>
                Select...
              </option>
              {NIGERIA_STATES.map((stateOption) => (
                <option key={stateOption} value={stateOption}>
                  {NIGERIA_STATE_LABELS[stateOption]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required placeholder="Ikeja" value={values.city} onChange={handleChange} />
          </div>
        </div>
        <SalaryInputGroup />
        {state?.error ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : "Save as draft"}
        </Button>
      </form>
    </div>
  );
}
