"use client";

import { Button } from "@eaglehr/ui";
import { Sparkles } from "lucide-react";
import { useActionState } from "react";
import { boostJobAction } from "@/lib/billing-actions";

export function BoostJobButton({ organizationId, jobId }: { organizationId: string; jobId: string }) {
  const [state, formAction, isPending] = useActionState(boostJobAction.bind(null, organizationId, jobId), undefined);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <Button type="submit" variant="outline" disabled={isPending} className="gap-1.5">
        <Sparkles className="h-4 w-4" aria-hidden />
        {isPending ? "Redirecting..." : "Boost this job"}
      </Button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
