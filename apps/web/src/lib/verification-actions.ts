"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchFormData, ApiError, friendlyUploadError } from "./api";
import type { ActionState } from "./organization-actions";

export async function resendVerificationEmailAction(): Promise<ActionState> {
  try {
    await apiFetch("/auth/resend-verification-email", { method: "POST" });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to resend verification email." };
  }
  return { success: "Verification email sent — check your inbox." };
}

export async function submitJobSeekerVerificationAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const nin = formData.get("nin");
  const file = formData.get("file");

  if (typeof nin !== "string" || !/^\d{11}$/.test(nin.trim())) {
    return { error: "NIN must be exactly 11 digits." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please upload a photo or scan of your NIN slip or ID card." };
  }

  const forward = new FormData();
  forward.append("nin", nin.trim());
  forward.append("file", file);

  try {
    await apiFetchFormData("/me/profile/verification", forward);
  } catch (err) {
    return { error: friendlyUploadError(err, "Failed to submit verification.") };
  }

  revalidatePath("/verify");
  return { success: "Submitted for review. We'll notify you once it's approved." };
}

export async function uploadOrganizationDocumentAction(
  organizationId: string,
  type: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  const forward = new FormData();
  forward.append("file", file);

  try {
    await apiFetchFormData(`/organizations/${organizationId}/verification/documents/${type}`, forward);
  } catch (err) {
    return { error: friendlyUploadError(err, "Failed to upload document.") };
  }

  revalidatePath("/verify");
  return { success: "Uploaded." };
}

export async function updateRcNumberAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const rcNumber = formData.get("rcNumber");
  if (typeof rcNumber !== "string" || rcNumber.trim().length < 2) {
    return { error: "Please enter a valid RC/registration number." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}`, { method: "PATCH", body: { rcNumber: rcNumber.trim() } });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to save RC number." };
  }

  revalidatePath("/verify");
  return { success: "RC number saved." };
}

export async function submitOrganizationForVerificationAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch(`/organizations/${organizationId}/verification/submit`, { method: "POST" });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to submit for verification." };
  }

  revalidatePath("/verify");
  return { success: "Submitted for review. We'll notify you once it's approved." };
}
