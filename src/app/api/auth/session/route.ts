import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

// Cookie configuration
const AUTH_COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * POST /api/auth/session
 * Sets the authentication cookie with the Firebase ID token
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error setting auth cookie', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to set session' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/session
 * Checks if user has a valid session
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME);

    return NextResponse.json({
      authenticated: !!token?.value,
    });
  } catch (error) {
    logger.error('Error checking session', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
