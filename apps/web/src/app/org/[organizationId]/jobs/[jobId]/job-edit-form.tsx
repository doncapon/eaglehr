"use client";

import { Button, Input, Label, Select, Textarea } from "@eaglehr/ui";
import { EMPLOYMENT_TYPES, NIGERIA_STATE_LABELS, NIGERIA_STATES, WORK_MODES } from "@eaglehr/types";
import { useActionState } from "react";
import { SalaryInputGroup } from "@/components/salary-input-group";
import { updateJobAction } from "@/lib/job-actions";

interface JobEditFormProps {
  organizationId: string;
  jobId: string;
  job: {
    title: string;
    description: string;
    responsibilities: string | null;
    requirements: string | null;
    employmentType: string;
    workMode: string;
    state: string;
    city: string;
    salaryMinKobo: number | null;
    salaryMaxKobo: number | null;
  };
}

export function JobEditForm({ organizationId, jobId, job }: JobEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateJobAction.bind(null, organizationId, jobId), undefined);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Job title</Label>
        <Input id="title" name="title" defaultValue={job.title} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={job.description} required rows={6} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="responsibilities">Responsibilities</Label>
        <Textarea id="responsibilities" name="responsibilities" defaultValue={job.responsibilities ?? ""} rows={4} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea id="requirements" name="requirements" defaultValue={job.requirements ?? ""} rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employmentType">Employment type</Label>
          <Select id="employmentType" name="employmentType" defaultValue={job.employmentType}>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="workMode">Work mode</Label>
          <Select id="workMode" name="workMode" defaultValue={job.workMode}>
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
          <Select id="state" name="state" defaultValue={job.state}>
            {NIGERIA_STATES.map((stateOption) => (
              <option key={stateOption} value={stateOption}>
                {NIGERIA_STATE_LABELS[stateOption]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={job.city} required />
        </div>
      </div>
      <SalaryInputGroup defaultMinKobo={job.salaryMinKobo} defaultMaxKobo={job.salaryMaxKobo} />
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
