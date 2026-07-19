import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "./lib/cookies";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/org",
  "/profile",
  "/applications",
  "/onboarding",
  "/invitations",
  "/admin",
  "/verify",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Coarse check only (cookie presence, not signature/expiry — that's verified
  // server-side on every API call). Pages call requireUser() for the real check.
  if (!request.cookies.has(ACCESS_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/org/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/onboarding/:path*",
    "/invitations/:path*",
    "/admin/:path*",
    "/verify/:path*",
  ],
};
