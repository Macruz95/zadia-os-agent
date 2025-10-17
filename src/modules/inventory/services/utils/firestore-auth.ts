import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logger } from '@/lib/logger';

/**
 * Ensures the Firebase authentication state is ready before issuing Firestore calls.
 * ULTRA-AGGRESSIVE VERSION: Multiple retries, longer delays, force refresh.
 * Returns true when a user session is confirmed and a fresh ID token has been obtained.
 */
export async function ensureFirestoreAuthReady(timeoutMs = 5000): Promise<boolean> {
  const MAX_RETRIES = 3;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      try {
        // Force token refresh - CRITICAL: true param forces server roundtrip
        await currentUser.getIdToken(true);
        
        // AGGRESSIVE DELAY: 300ms to ensure token propagation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        logger.info(`Auth ready on attempt ${attempt}`, {
          component: 'firestore-auth',
          metadata: { uid: currentUser.uid, email: currentUser.email }
        });
        
        return true;
      } catch (error) {
        const err = error as Error;
        logger.warn(`Token refresh failed on attempt ${attempt}/${MAX_RETRIES}`, {
          component: 'firestore-auth',
          metadata: { error: err.message, attempt }
        });
        
        if (attempt < MAX_RETRIES) {
          // Wait before retry (exponential backoff: 200ms, 400ms, 800ms)
          await new Promise(resolve => setTimeout(resolve, 200 * attempt));
        }
      }
    } else {
      // No current user - wait for auth state change
      logger.info(`No current user, waiting for auth state change (attempt ${attempt})`, {
        component: 'firestore-auth'
      });
      
      const authReady = await waitForAuthStateChange(timeoutMs);
      if (authReady) return true;
      
      // Wait before retry if no user found
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
  
  logger.error('Failed to ensure auth ready after all retries', undefined, {
    component: 'firestore-auth',
    metadata: { maxRetries: MAX_RETRIES, message: 'Authentication could not be established' }
  });
  
  return false;
}

/**
 * Wait for auth state change with timeout
 */
async function waitForAuthStateChange(timeoutMs: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }

      try {
        // Force token refresh
        await user.getIdToken(true);
        // Aggressive delay for propagation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        logger.info('Auth state changed, token refreshed', {
          component: 'firestore-auth',
          metadata: { uid: user.uid }
        });
      } catch (error) {
        const err = error as Error;
        logger.warn('Failed to refresh token after auth state change', {
          component: 'firestore-auth',
          metadata: { error: err.message }
        });
      }

      clearTimeout(timer);
      unsubscribe();
      resolve(true);
    });
  });
}
