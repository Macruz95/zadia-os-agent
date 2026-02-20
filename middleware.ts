import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, isAuthRoute } from '@/config/routes.config';

const AUTH_COOKIE_NAME = 'auth-token';

/**
 * Middleware for ZADIA OS
 * Checks for auth cookie presence and applies security headers.
 * Note: Full token validation happens in API routes via Firebase Admin.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = isProtectedRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  // Check if auth cookie exists (presence check only)
  // Full validation is done server-side in API routes
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = Boolean(authCookie?.value);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    // console.log(`[Middleware] ${pathname} | isProtected: ${isProtected} | isAuth: ${isAuth} | hasAuthCookie: ${isAuthenticated}`);
  }

  // Redirect unauthenticated access to protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuth && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content-Security-Policy
  // Note: 'unsafe-inline' for script-src is required for Google Analytics and Next.js inline scripts.
  // For production, implement nonce-based CSP via Next.js middleware or a custom solution.
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.stripe.com https://*.openrouter.ai https://api.groq.com https://generativelanguage.googleapis.com wss://*.firebaseio.com; " +
    "frame-src 'self' https://js.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
