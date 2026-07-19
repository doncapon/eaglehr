"use client";

import { Button, Input, Label, Select } from "@eaglehr/ui";
import { ORG_ROLES } from "@eaglehr/types";
import { useActionState } from "react";
import { inviteMemberAction } from "@/lib/organization-actions";

export function InviteMemberForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, isPending] = useActionState(inviteMemberAction.bind(null, organizationId), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="invite-email">Invite a teammate</Label>
        <Input id="invite-email" name="email" type="email" required placeholder="teammate@company.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <Select id="invite-role" name="role" defaultValue="RECRUITER" className="w-40">
          {ORG_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send invite"}
      </Button>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
    </form>
  );
}
