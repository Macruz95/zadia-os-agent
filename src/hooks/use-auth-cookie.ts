'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Hook to sync Firebase Auth token with HTTP-only cookie for middleware
 * This enables server-side route protection
 */
export function useAuthCookie() {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Get the ID token
        const token = await user.getIdToken();
        
        // Set the auth cookie via API route
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
      } else {
        // Clear the auth cookie
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
      }
    });

    return () => unsubscribe();
  }, []);
}

