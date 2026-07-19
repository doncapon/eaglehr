"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./api";
import type { ActionState } from "./organization-actions";

type ReviewStatus = "APPROVED" | "REJECTED";

function extractNote(formData: FormData): string | undefined {
  const note = formData.get("note");
  return typeof note === "string" && note.trim() ? note.trim() : undefined;
}

export async function reviewJobSeekerVerificationAction(
  profileId: string,
  status: ReviewStatus,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch(`/admin/verifications/job-seekers/${profileId}`, {
      method: "PATCH",
      body: { status, note: extractNote(formData) },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update verification." };
  }
  revalidatePath("/admin/verifications");
  return { success: `Marked ${status.toLowerCase()}.` };
}

export async function reviewOrganizationVerificationAction(
  organizationId: string,
  status: ReviewStatus,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch(`/admin/verifications/organizations/${organizationId}`, {
      method: "PATCH",
      body: { status, note: extractNote(formData) },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update verification." };
  }
  revalidatePath("/admin/verifications");
  return { success: `Marked ${status.toLowerCase()}.` };
}
