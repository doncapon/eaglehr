"use client";

import { Button, Input, Label } from "@eaglehr/ui";
import { useActionState } from "react";
import { updateRcNumberAction } from "@/lib/verification-actions";

interface RcNumberFieldProps {
  organizationId: string;
  rcNumber: string | null;
  disabled?: boolean;
}

export function RcNumberField({ organizationId, rcNumber, disabled }: RcNumberFieldProps) {
  const [state, formAction, isPending] = useActionState(updateRcNumberAction.bind(null, organizationId), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <Label htmlFor={`rcNumber-${organizationId}`}>CAC / RC number</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={`rcNumber-${organizationId}`}
          name="rcNumber"
          defaultValue={rcNumber ?? ""}
          placeholder="RC1234567"
          className="max-w-xs"
          disabled={disabled}
        />
        <Button type="submit" size="sm" variant="outline" disabled={isPending || disabled}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-xs text-green-600">{state.success}</p> : null}
    </form>
  );
}
