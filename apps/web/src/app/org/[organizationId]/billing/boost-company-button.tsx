"use client";

import { Button } from "@eaglehr/ui";
import { Sparkles } from "lucide-react";
import { useActionState } from "react";
import { boostCompanyAction } from "@/lib/billing-actions";

export function BoostCompanyButton({ organizationId }: { organizationId: string }) {
  const [state, formAction, isPending] = useActionState(boostCompanyAction.bind(null, organizationId), undefined);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <Button type="submit" disabled={isPending} className="gap-1.5">
        <Sparkles className="h-4 w-4" aria-hidden />
        {isPending ? "Redirecting..." : "Boost my company"}
      </Button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
