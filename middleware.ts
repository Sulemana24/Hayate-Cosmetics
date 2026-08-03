import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only check admin routes
  if (path.startsWith("/admin")) {
    // Allow public paths (auth page)
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // Check for session
    const session =
      request.cookies.get("admin_session") || request.cookies.get("session");

    if (!session) {
      const url = new URL("/admin", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
