"use server";

import { EmployeePersonalDetailsSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "./api";
import type { ActionState } from "./organization-actions";

function fieldOf(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function updateMyEmployeeDetailsAction(
  employeeId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = EmployeePersonalDetailsSchema.safeParse({
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
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  try {
    await apiFetch(`/me/employee-records/${employeeId}`, { method: "PATCH", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to save your details." };
  }

  revalidatePath("/employment");
  return { success: "Saved." };
}
