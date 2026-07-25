"use server";

import { revalidatePath } from "next/cache";
import { apiFetchFormData, friendlyUploadError } from "./api";
import type { ActionState } from "./organization-actions";

export async function uploadResumeAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a PDF, DOC, or DOCX file to upload." };
  }

  const forward = new FormData();
  forward.append("file", file);

  try {
    await apiFetchFormData("/me/profile/resume", forward);
  } catch (err) {
    return { error: friendlyUploadError(err, "Failed to upload resume.") };
  }

  revalidatePath("/profile");
  revalidatePath("/jobs", "layout");
  return { success: `Uploaded ${file.name}.` };
}
