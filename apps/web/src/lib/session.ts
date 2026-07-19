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
