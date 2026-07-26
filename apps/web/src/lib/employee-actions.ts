"use server";

import { CreateEmployeeNoteSchema, CreateEmployeeSchema, UpdateEmployeeSchema } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch, apiFetchFormData, friendlyUploadError } from "./api";
import type { ActionState } from "./organization-actions";

/** Empty strings from optional form fields should parse as "not provided," not "provided as empty." */
function fieldOf(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function employeeFieldsFromForm(formData: FormData) {
  return {
    applicationId: fieldOf(formData, "applicationId"),

    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: fieldOf(formData, "email"),
    phone: fieldOf(formData, "phone"),
    dateOfBirth: fieldOf(formData, "dateOfBirth"),
    gender: fieldOf(formData, "gender"),
    maritalStatus: fieldOf(formData, "maritalStatus"),
    addressLine: fieldOf(formData, "addressLine"),
    city: fieldOf(formData, "city"),
    state: fieldOf(formData, "state"),

    employeeNumber: fieldOf(formData, "employeeNumber"),
    department: fieldOf(formData, "department"),
    jobTitle: formData.get("jobTitle"),
    employmentType: formData.get("employmentType"),
    startDate: formData.get("startDate"),
    managerId: fieldOf(formData, "managerId"),
    status: fieldOf(formData, "status"),
    endDate: fieldOf(formData, "endDate"),

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
    leaveBalanceDays: fieldOf(formData, "leaveBalanceDays") ? Number(formData.get("leaveBalanceDays")) : undefined,
  };
}

export async function createEmployeeAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = CreateEmployeeSchema.safeParse(employeeFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the employee details." };
  }

  let employeeId: string;
  try {
    const employee = await apiFetch<{ id: string }>(`/organizations/${organizationId}/employees`, {
      method: "POST",
      body: parsed.data,
    });
    employeeId = employee.id;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to add employee." };
  }

  revalidatePath(`/org/${organizationId}/employees`);
  redirect(`/org/${organizationId}/employees/${employeeId}`);
}

export async function updateEmployeeAction(
  organizationId: string,
  employeeId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = UpdateEmployeeSchema.safeParse(employeeFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the employee details." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}/employees/${employeeId}`, {
      method: "PATCH",
      body: parsed.data,
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update employee." };
  }

  revalidatePath(`/org/${organizationId}/employees/${employeeId}`);
  revalidatePath(`/org/${organizationId}/employees`);
  return { success: "Saved." };
}

export async function addEmployeeNoteAction(
  organizationId: string,
  employeeId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = CreateEmployeeNoteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter a note." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}/employees/${employeeId}/notes`, {
      method: "POST",
      body: parsed.data,
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to add note." };
  }

  revalidatePath(`/org/${organizationId}/employees/${employeeId}`);
  return { success: "Note added." };
}

export async function uploadEmployeeDocumentAction(
  organizationId: string,
  employeeId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const type = formData.get("type");
  const file = formData.get("file");
  if (typeof type !== "string" || !type) {
    return { error: "Please choose a document type." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  const forward = new FormData();
  forward.append("file", file);

  try {
    await apiFetchFormData(`/organizations/${organizationId}/employees/${employeeId}/documents/${type}`, forward);
  } catch (err) {
    return { error: friendlyUploadError(err, "Failed to upload document.") };
  }

  revalidatePath(`/org/${organizationId}/employees/${employeeId}`);
  return { success: "Uploaded." };
}
