"use server";

import { CreateLeaveRequestSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "./api";
import type { ActionState } from "./organization-actions";

export async function createMyLeaveRequestAction(
  employeeId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = CreateLeaveRequestSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your leave request." };
  }

  try {
    await apiFetch(`/me/employee-records/${employeeId}/leave-requests`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to submit leave request." };
  }

  revalidatePath("/employment");
  return { success: "Leave request submitted." };
}

export async function cancelMyLeaveRequestAction(
  employeeId: string,
  leaveRequestId: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  try {
    await apiFetch(`/me/employee-records/${employeeId}/leave-requests/${leaveRequestId}/cancel`, {
      method: "PATCH",
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to cancel leave request." };
  }

  revalidatePath("/employment");
  return { success: "Leave request cancelled." };
}
