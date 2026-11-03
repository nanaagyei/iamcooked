import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * First-pass gate: cookie presence only (Edge-safe; avoids Prisma in middleware).
 * Real authorization (session + ADMIN role / ADMIN_EMAILS) lives in route handlers
 * via `requireAuth()` / `requireAdmin()`.
 */
function hasSessionCookie(request: NextRequest) {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("__Host-authjs.session-token")
  );
}

export function middleware(request: NextRequest) {
  const isAuthenticated = hasSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && !isAuthenticated) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 },
    );
  }

  if ((pathname.startsWith("/admin") || pathname.startsWith("/settings")) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/settings/:path*", "/api/admin/:path*"],
};
