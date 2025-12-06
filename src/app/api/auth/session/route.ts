import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { getAdminAuth } from '@/lib/firebase-admin';

// Cookie configuration
const AUTH_COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * POST /api/auth/session
 * Validates the Firebase ID token server-side and sets an HTTP-only cookie.
 * In development without FIREBASE_SERVICE_ACCOUNT_KEY, skips server validation.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Check if Firebase Admin is available for server-side validation
    const adminAuth = getAdminAuth();
    
    if (adminAuth) {
      // Validate token with Firebase Admin to prevent forged cookies
      const decoded = await adminAuth.verifyIdToken(token, true);
      
      cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return NextResponse.json({ success: true, uid: decoded.uid });
    } else {
      // Development mode without Firebase Admin - set cookie without server validation
      // Client-side Firebase Auth still validates the token
      cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      logger.warn('Session set without server-side validation (Firebase Admin not configured)');
      return NextResponse.json({ success: true, uid: 'dev-mode' });
    }
  } catch (error) {
    logger.error('Error setting auth cookie', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to set session' }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session
 * Clears the authentication cookie
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error clearing auth cookie', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}

/**
 * GET /api/auth/session
 * Verifies if the session cookie corresponds to a valid Firebase ID token.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check if Firebase Admin is available for server-side validation
    const adminAuth = getAdminAuth();
    
    if (adminAuth) {
      await adminAuth.verifyIdToken(token, true);
      return NextResponse.json({ authenticated: true });
    } else {
      // Development mode - trust the cookie exists (client-side validates)
      return NextResponse.json({ authenticated: true, mode: 'dev' });
    }
  } catch (error) {
    logger.error('Error checking session', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
