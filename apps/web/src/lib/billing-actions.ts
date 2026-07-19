"use server";

import { CheckoutSchema } from "@eaglehr/types";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./api";
import type { ActionState } from "./organization-actions";

export async function checkoutAction(
  organizationId: string,
  planId: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  const parsed = CheckoutSchema.safeParse({ planId });
  if (!parsed.success) {
    return { error: "Invalid plan selected." };
  }

  let authorizationUrl: string;
  try {
    const result = await apiFetch<{ authorizationUrl: string }>(`/organizations/${organizationId}/billing/checkout`, {
      method: "POST",
      body: parsed.data,
    });
    authorizationUrl = result.authorizationUrl;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to start checkout." };
  }

  redirect(authorizationUrl);
}

export async function boostJobAction(
  organizationId: string,
  jobId: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  let authorizationUrl: string;
  try {
    const result = await apiFetch<{ authorizationUrl: string }>(
      `/organizations/${organizationId}/billing/boost-job/${jobId}`,
      { method: "POST" },
    );
    authorizationUrl = result.authorizationUrl;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to start boost checkout." };
  }

  redirect(authorizationUrl);
}

export async function boostCompanyAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  let authorizationUrl: string;
  try {
    const result = await apiFetch<{ authorizationUrl: string }>(
      `/organizations/${organizationId}/billing/boost-company`,
      { method: "POST" },
    );
    authorizationUrl = result.authorizationUrl;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to start boost checkout." };
  }

  redirect(authorizationUrl);
}
