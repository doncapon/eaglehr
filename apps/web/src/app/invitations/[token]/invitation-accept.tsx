"use client";

import { Button } from "@eaglehr/ui";
import { useActionState } from "react";
import { acceptInvitationAction } from "@/lib/organization-actions";

export function InvitationAccept({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(acceptInvitationAction.bind(null, token), undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">You&apos;ve been invited</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Accept this invitation to join the organization&apos;s EagleHR workspace.
      </p>
      <form action={formAction}>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Accepting..." : "Accept invitation"}
        </Button>
      </form>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
