"use client";

import { Button, Input, Label } from "@eaglehr/ui";
import { useActionState } from "react";
import { updatePlatformSettingsAction } from "@/lib/admin-actions";

interface SettingsFormProps {
  boostPriceKobo: number;
  boostDurationDays: number;
}

export function SettingsForm({ boostPriceKobo, boostDurationDays }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updatePlatformSettingsAction, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="boostPriceNaira">Boost price (NGN)</Label>
        <Input
          id="boostPriceNaira"
          name="boostPriceNaira"
          type="number"
          min={0}
          step="1"
          defaultValue={boostPriceKobo / 100}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="boostDurationDays">Boost duration (days)</Label>
        <Input
          id="boostDurationDays"
          name="boostDurationDays"
          type="number"
          min={1}
          step="1"
          defaultValue={boostDurationDays}
          required
        />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
