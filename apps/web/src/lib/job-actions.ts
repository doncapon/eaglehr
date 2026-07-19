"use server";

import { ApplyToJobSchema, CreateJobSchema, UpdateJobSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./api";
import type { ActionState } from "./organization-actions";

function parseSalaryToKobo(value: FormDataEntryValue | null): number | undefined {
  if (!value || typeof value !== "string" || value.trim() === "") return undefined;
  return Math.round(Number(value) * 100);
}

export async function createJobAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = CreateJobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities") || undefined,
    requirements: formData.get("requirements") || undefined,
    employmentType: formData.get("employmentType"),
    workMode: formData.get("workMode"),
    state: formData.get("state"),
    city: formData.get("city"),
    salaryMinKobo: parseSalaryToKobo(formData.get("salaryMinKobo")),
    salaryMaxKobo: parseSalaryToKobo(formData.get("salaryMaxKobo")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the job details." };
  }

  let jobId: string;
  try {
    const job = await apiFetch<{ id: string }>(`/organizations/${organizationId}/jobs`, {
      method: "POST",
      body: parsed.data,
    });
    jobId = job.id;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create job." };
  }

  revalidatePath(`/org/${organizationId}/jobs`);
  redirect(`/org/${organizationId}/jobs/${jobId}`);
}

export async function updateJobAction(
  organizationId: string,
  jobId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = UpdateJobSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    responsibilities: formData.get("responsibilities") || undefined,
    requirements: formData.get("requirements") || undefined,
    employmentType: formData.get("employmentType") || undefined,
    workMode: formData.get("workMode") || undefined,
    state: formData.get("state") || undefined,
    city: formData.get("city") || undefined,
    salaryMinKobo: parseSalaryToKobo(formData.get("salaryMinKobo")),
    salaryMaxKobo: parseSalaryToKobo(formData.get("salaryMaxKobo")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the job details." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}/jobs/${jobId}`, { method: "PATCH", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update job." };
  }

  revalidatePath(`/org/${organizationId}/jobs`);
  revalidatePath(`/org/${organizationId}/jobs/${jobId}`);
  return { success: "Job updated." };
}

export async function publishJobAction(organizationId: string, jobId: string): Promise<void> {
  await apiFetch(`/organizations/${organizationId}/jobs/${jobId}/publish`, { method: "POST" });
  revalidatePath(`/org/${organizationId}/jobs`);
  revalidatePath(`/org/${organizationId}/jobs/${jobId}`);
}

export async function deleteJobAction(organizationId: string, jobId: string): Promise<void> {
  await apiFetch(`/organizations/${organizationId}/jobs/${jobId}`, { method: "DELETE" });
  revalidatePath(`/org/${organizationId}/jobs`);
  redirect(`/org/${organizationId}/jobs`);
}

export async function updateApplicationStatusAction(
  organizationId: string,
  jobId: string,
  applicationId: string,
  formData: FormData,
): Promise<void> {
  const status = formData.get("status");
  await apiFetch(`/organizations/${organizationId}/applications/${applicationId}/status`, {
    method: "PATCH",
    body: { status },
  });
  revalidatePath(`/org/${organizationId}/jobs/${jobId}/applicants`);
}

export async function applyToJobAction(
  jobId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ApplyToJobSchema.safeParse({
    coverLetter: formData.get("coverLetter") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please check your application details." };
  }

  try {
    await apiFetch(`/jobs/${jobId}/applications`, { method: "POST", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to submit application." };
  }

  revalidatePath("/applications");
  return { success: "Application submitted! You can track its status from your dashboard." };
}
