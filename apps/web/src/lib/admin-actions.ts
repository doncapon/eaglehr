"use server";

import { UpdatePlatformSettingsSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./api";
import type { ActionState } from "./organization-actions";

export async function updatePlatformSettingsAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = UpdatePlatformSettingsSchema.safeParse({
    boostPriceKobo: Math.round(Number(formData.get("boostPriceNaira")) * 100),
    boostDurationDays: Number(formData.get("boostDurationDays")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the values entered." };
  }

  try {
    await apiFetch("/admin/settings", { method: "PATCH", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update settings." };
  }

  revalidatePath("/admin/settings");
  return { success: "Settings updated." };
}
