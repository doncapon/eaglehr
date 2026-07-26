"use server";

import { CreateOrganizationSchema, InviteMemberSchema, UpdateOrganizationSchema, type OrgRole } from "@eaglehr/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./api";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function createOrganizationAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = CreateOrganizationSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  let organizationId: string;
  try {
    const org = await apiFetch<{ id: string }>("/organizations", { method: "POST", body: parsed.data });
    organizationId = org.id;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create organization." };
  }

  redirect(`/org/${organizationId}/dashboard`);
}

export async function inviteMemberAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = InviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please provide a valid email and role." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}/invitations`, { method: "POST", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to send invitation." };
  }

  revalidatePath(`/org/${organizationId}/team`);
  return { success: `Invitation sent to ${parsed.data.email}.` };
}

export async function updateOrganizationAction(
  organizationId: string,
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const field = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() !== "" ? value : undefined;
  };

  const parsed = UpdateOrganizationSchema.safeParse({
    name: field("name"),
    industry: field("industry"),
    size: field("size"),
    websiteUrl: field("websiteUrl"),
    rcNumber: field("rcNumber"),
    addressLine: field("addressLine"),
    city: field("city"),
    state: field("state"),
    contactPersonName: field("contactPersonName"),
    contactPersonPhone: field("contactPersonPhone"),
    taxId: field("taxId"),
    foundingYear: field("foundingYear") ? Number(formData.get("foundingYear")) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  try {
    await apiFetch(`/organizations/${organizationId}`, { method: "PATCH", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to save company profile." };
  }

  revalidatePath(`/org/${organizationId}/settings`);
  return { success: "Company profile saved." };
}

export async function updateMemberRoleAction(organizationId: string, memberId: string, role: OrgRole): Promise<void> {
  await apiFetch(`/organizations/${organizationId}/members/${memberId}`, { method: "PATCH", body: { role } });
  revalidatePath(`/org/${organizationId}/team`);
}

export async function removeMemberAction(organizationId: string, memberId: string): Promise<void> {
  await apiFetch(`/organizations/${organizationId}/members/${memberId}`, { method: "DELETE" });
  revalidatePath(`/org/${organizationId}/team`);
}

export async function acceptInvitationAction(
  token: string,
  _prevState: ActionState | undefined,
  _formData: FormData,
): Promise<ActionState> {
  let organizationId: string;
  try {
    const organization = await apiFetch<{ id: string }>(`/organizations/invitations/${token}/accept`, {
      method: "POST",
    });
    organizationId = organization.id;
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to accept invitation." };
  }

  redirect(`/org/${organizationId}/dashboard`);
}
