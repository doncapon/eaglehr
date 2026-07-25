import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "./cookies";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      body && typeof body === "object" && "message" in body ? String((body as { message: unknown }).message) : `Request failed with status ${status}`;
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

/**
 * Some failure modes (a proxy timeout, a request rejected before it reaches Nest's
 * JSON error formatting, an oversized-upload rejection) come back as plain text or
 * HTML instead of JSON. Falling back instead of letting JSON.parse throw keeps
 * these as a normal catchable ApiError instead of an uncaught server exception.
 */
function safeJsonParse(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 300) };
  }
}

async function request<T>(path: string, { token, body, headers, ...rest }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const text = await res.text();
  const parsed = safeJsonParse(text);

  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }
  // Nest sends an empty body (not the literal "null") for 200 responses
  // whose handler returns null, as well as for 204 No Content.
  return parsed as T;
}

/** Reads the httpOnly access-token cookie set by the auth server actions. */
export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

/** Authenticated server-side request to the EagleHR API, using the caller's session cookie. */
export async function apiFetch<T>(path: string, options?: RequestOptions): Promise<T> {
  const token = await getAccessToken();
  return request<T>(path, { ...options, token });
}

/** Unauthenticated server-side request (public endpoints, or login/register themselves). */
export async function publicApiFetch<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, options);
}

/**
 * Authenticated multipart/form-data upload. Deliberately bypasses `request()` —
 * FormData bodies must not be JSON.stringify'd, and fetch needs to set its own
 * `Content-Type` (with the multipart boundary) rather than the JSON one.
 */
export async function apiFetchFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const parsed = safeJsonParse(text);

  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }
  return parsed as T;
}
