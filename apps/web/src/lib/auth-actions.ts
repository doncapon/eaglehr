"use server";

import { ForgotPasswordSchema, LoginSchema, OrgIndustrySchema, RegisterSchema, ResetPasswordSchema } from "@eaglehr/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, publicApiFetch } from "./api";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./cookies";

export interface AuthFormState {
  error?: string;
  success?: string;
  /** Only set on a real authentication failure (valid email format, wrong credentials) — not on a plain validation error. */
  showForgotPasswordHint?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function setAuthCookies(tokens: AuthTokens) {
  const store = await cookies();
  // Decoupled from NODE_ENV: `next start` sets NODE_ENV=production even when
  // served over plain HTTP on localhost, and a `secure` cookie is silently
  // dropped by the browser over HTTP — which would break login entirely.
  // COOKIE_SECURE lets a local production build opt out explicitly.
  const secureCookies = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production";

  store.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // matches API's 15m access token expiry
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // matches API's 30d refresh token expiry
  });
}

/** Only ever redirect to a same-origin relative path, to avoid an open redirect via `next`. */
function safeRedirectTarget(next: FormDataEntryValue | null): string {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export async function registerAction(_prevState: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const isCompanyAccount = formData.get("accountType") === "company";
  const companyName = formData.get("companyName");
  if (isCompanyAccount && (typeof companyName !== "string" || companyName.trim().length < 2)) {
    return { error: "Please enter your company name." };
  }
  const industry = formData.get("industry");
  if (isCompanyAccount && !OrgIndustrySchema.safeParse(industry).success) {
    return { error: "Please select your industry." };
  }

  let tokens: AuthTokens;
  try {
    tokens = await publicApiFetch<AuthTokens>("/auth/register", { method: "POST", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Registration failed. Please try again." };
  }

  if (isCompanyAccount && typeof companyName === "string") {
    try {
      // Uses the freshly issued token directly (not a cookie) — registering doesn't
      // start a browser session, so there's nothing in the cookie jar for apiFetch to read yet.
      await publicApiFetch("/organizations", {
        method: "POST",
        body: { name: companyName.trim(), industry },
        token: tokens.accessToken,
      });
    } catch {
      // Account was created successfully either way — they can set up the company after signing in.
    }
  }

  // Registration no longer signs the user in — they confirm their email and log in explicitly.
  redirect("/login?registered=1");
}

export async function loginAction(_prevState: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  try {
    const tokens = await publicApiFetch<AuthTokens>("/auth/login", { method: "POST", body: parsed.data });
    await setAuthCookies(tokens);
  } catch (err) {
    // parsed.data.email is already a validly-formatted email at this point (Zod checked it above),
    // so this is a real credentials failure — safe to surface the forgot-password hint here.
    return {
      error: err instanceof ApiError ? err.message : "Invalid email or password.",
      showForgotPasswordHint: true,
    };
  }

  redirect(safeRedirectTarget(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = ForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await publicApiFetch("/auth/forgot-password", { method: "POST", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to send reset link. Please try again." };
  }

  return { success: "If an account exists for that email, we've sent a password reset link." };
}

export async function resetPasswordAction(
  token: string,
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const parsed = ResetPasswordSchema.safeParse({ token, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  try {
    await publicApiFetch("/auth/reset-password", { method: "POST", body: parsed.data });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to reset password. Please try again." };
  }

  return { success: "Password reset. You can now sign in with your new password." };
}
