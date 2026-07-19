import "server-only";
import { getAccessToken } from "./api";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

/**
 * Verification documents are never public (unlike resumes) — the API requires
 * a Bearer token, but the browser only holds an httpOnly session cookie. This
 * proxies the authenticated request server-side and streams the file back.
 */
export async function proxyVerificationDownload(apiPath: string): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const res = await fetch(`${API_URL}${apiPath}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text || JSON.stringify({ message: "Not found" }), { status: res.status });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment",
    },
  });
}
