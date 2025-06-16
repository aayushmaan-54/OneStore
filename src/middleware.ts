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
  '/admin/products',
  '/admin/orders',
  '/admin/users',
  '/cart',
  '/orders'
]);


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  // Match /reset-password/:token (dynamic token)
  const isResetPasswordToken = /^\/reset-password\/[^/]+$/.test(pathname);
  const isUnauthOnly = UNAUTHENTICATED_ONLY_ROUTES.has(pathname);
  const isProtected = PROTECTED_ROUTES.has(pathname);

  const isAuthenticated = !!sessionCookie;

  if ((isUnauthOnly || isResetPasswordToken) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

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
    '/admin/products',
    '/admin/orders',
    '/admin/users'
  ],
};
