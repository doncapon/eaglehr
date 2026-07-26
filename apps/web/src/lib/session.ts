import { cache } from "react";
import { apiFetch } from "./api";

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isPlatformAdmin: boolean;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  verificationStatus: string;
}

/** Cached per-request: multiple Server Components on the same page share one call. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    return await apiFetch<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
});

export const getMyOrganizations = cache(async (): Promise<OrganizationSummary[]> => {
  try {
    return await apiFetch<OrganizationSummary[]>("/organizations");
  } catch {
    return [];
  }
});

export interface MyEmployeeRecordSummary {
  id: string;
  jobTitle: string;
  status: string;
  organization: { id: string; name: string };
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelationship: string | null;
  nextOfKinAddress: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  taxId: string | null;
}

/** Employee records tied to the current user's account (e.g. hired via the platform), for self-service HR features. */
export const getMyEmployeeRecords = cache(async (): Promise<MyEmployeeRecordSummary[]> => {
  try {
    return await apiFetch<MyEmployeeRecordSummary[]>("/me/employee-records");
  } catch {
    return [];
  }
});
