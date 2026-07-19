"use client";

import { Button, Input, Label } from "@eaglehr/ui";
import { useActionState } from "react";
import { createOrganizationAction } from "@/lib/organization-actions";

export default function CreateOrganizationPage() {
  const [state, formAction, isPending] = useActionState(createOrganizationAction, undefined);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-bold">Set up your company</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a private workspace for your company&apos;s HR team.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" required placeholder="Zenith Foods Ltd" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">Industry (optional)</Label>
          <Input id="industry" name="industry" placeholder="FMCG, Fintech, Logistics..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="websiteUrl">Website (optional)</Label>
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create company"}
        </Button>
      </form>
    </div>
  );
}
