"use server";

import { UpdateJobSeekerProfileSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./api";
import type { ActionState } from "./organization-actions";

export async function updateProfileAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const skillsRaw = formData.get("skills");
  const skills =
    typeof skillsRaw === "string" && skillsRaw.trim() !== ""
      ? skillsRaw
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined;

  const yearsRaw = formData.get("yearsOfExperience");

  const parsed = UpdateJobSeekerProfileSchema.safeParse({
    headline: formData.get("headline") || undefined,
    summary: formData.get("summary") || undefined,
    yearsOfExperience: yearsRaw && yearsRaw !== "" ? Number(yearsRaw) : undefined,
    currentState: formData.get("currentState") || undefined,
    currentCity: formData.get("currentCity") || undefined,
    skills,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your profile details." };
  }

  try {
    await apiFetch("/me/profile", { method: "PATCH", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update profile." };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profile updated." };
}
