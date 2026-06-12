import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isLoginPage = nextUrl.pathname === "/login";

  // If unauthenticated and not on login page, redirect to login
  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // If authenticated and on login page, redirect to dashboard
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, NextAuth needs this)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo_ikkfms.jpeg (logo file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo_ikkfms.jpeg).*)",
  ],
};
