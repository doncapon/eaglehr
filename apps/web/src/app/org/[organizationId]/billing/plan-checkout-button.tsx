"use client";

import { Button } from "@eaglehr/ui";
import { useActionState } from "react";
import { checkoutAction } from "@/lib/billing-actions";

export function PlanCheckoutButton({ organizationId, planId }: { organizationId: string; planId: string }) {
  const [state, formAction, isPending] = useActionState(checkoutAction.bind(null, organizationId, planId), undefined);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Redirecting..." : "Subscribe"}
      </Button>
      {state?.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
