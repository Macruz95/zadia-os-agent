/**
 * ZADIA OS - Routes Configuration
 * Centralized route management for the application
 */

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/clients',
  '/sales',
  '/inventory',
  '/projects',
] as const;

/**
 * Authentication routes (login, register, etc.)
 */
export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/google-complete',
] as const;

/**
 * Public routes accessible without authentication
 */
export const PUBLIC_ROUTES = [
  '/',
] as const;

/**
 * Check if a path matches any of the protected routes
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path matches any of the auth routes
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

