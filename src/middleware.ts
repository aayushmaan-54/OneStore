import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";


const UNAUTHENTICATED_ONLY_ROUTES = new Set([
  '/login',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
]);

const PROTECTED_ROUTES = new Set([
  "/profile",
  "/admin-dashboard"
]);


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  // Match /reset-password/:token (dynamic token)
  const isResetPasswordToken = /^\/reset-password\/[^/]+$/.test(pathname);
  const isUnauthOnly = UNAUTHENTICATED_ONLY_ROUTES.has(pathname);
  const isProtected = PROTECTED_ROUTES.has(pathname);

  const isAuthenticated = !!sessionCookie;

  // Redirect authenticated users away from auth pages
  if (isUnauthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/profile",
    "/login",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/reset-password/:token*",
    '/admin-dashboard',
  ],
};
