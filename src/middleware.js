import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-development-only-32-chars-long"
);

const SESSION_COOKIE_NAME = "ikkfms_session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, and public folder files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") || // files like favicon.ico, logo_ikkfms.jpeg
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let verified = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      verified = true;
    } catch (err) {
      verified = false;
    }
  }

  // If on login page and verified, redirect to dashboard
  if (pathname === "/login") {
    if (verified) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If not verified and trying to access any page, redirect to login
  if (!verified) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo_ikkfms.jpeg (logo file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo_ikkfms.jpeg).*)",
  ],
};
