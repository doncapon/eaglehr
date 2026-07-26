"use server";

import { CompleteEmployeeOnboardingSchema } from "@eaglehr/types";
import { redirect } from "next/navigation";
import { ApiError, publicApiFetch } from "./api";
import { setAuthCookies, type AuthTokens } from "./auth-actions";
import type { ActionState } from "./organization-actions";

function fieldOf(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function completeEmployeeOnboardingAction(
  token: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const parsed = CompleteEmployeeOnboardingSchema.safeParse({
    password,
    phone: fieldOf(formData, "phone"),
    dateOfBirth: fieldOf(formData, "dateOfBirth"),
    gender: fieldOf(formData, "gender"),
    maritalStatus: fieldOf(formData, "maritalStatus"),
    addressLine: fieldOf(formData, "addressLine"),
    city: fieldOf(formData, "city"),
    state: fieldOf(formData, "state"),
    emergencyContactName: fieldOf(formData, "emergencyContactName"),
    emergencyContactPhone: fieldOf(formData, "emergencyContactPhone"),
    emergencyContactRelationship: fieldOf(formData, "emergencyContactRelationship"),
    nextOfKinName: fieldOf(formData, "nextOfKinName"),
    nextOfKinPhone: fieldOf(formData, "nextOfKinPhone"),
    nextOfKinRelationship: fieldOf(formData, "nextOfKinRelationship"),
    nextOfKinAddress: fieldOf(formData, "nextOfKinAddress"),
    bankName: fieldOf(formData, "bankName"),
    bankAccountNumber: fieldOf(formData, "bankAccountNumber"),
    bankAccountName: fieldOf(formData, "bankAccountName"),
    taxId: fieldOf(formData, "taxId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  try {
    const tokens = await publicApiFetch<AuthTokens>(`/employee-onboarding/${token}/complete`, {
      method: "POST",
      body: parsed.data,
    });
    await setAuthCookies(tokens);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to complete onboarding. Please try again." };
  }

  redirect("/employment");
}
