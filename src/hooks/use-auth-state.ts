'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user.service';
import { UserProfile } from '@/validations/auth.schema';
import { logger } from '@/lib/logger';

/**
 * Hook that manages authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (firebaseUser) {
        const userProfile = await UserService.getUserProfile(firebaseUser.uid);
        setUser(userProfile);
      }
    } catch (error) {
      logger.error(
        'Error refreshing user profile',
        error instanceof Error ? error : new Error('Unknown error'),
        { component: 'useAuthState' }
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Force token refresh to get latest security rules
          await firebaseUser.getIdToken(true);
          
          // Update last login
          await UserService.updateLastLogin(firebaseUser.uid);
          
          // Try to get user profile
          try {
            const userProfile = await UserService.getUserProfile(firebaseUser.uid);
            setUser(userProfile);
          } catch {
            // If permission denied, user might not have custom claims yet
            logger.warn('Could not load user profile - user may not have role assigned yet', {
              component: 'useAuthState',
              metadata: {
                userId: firebaseUser.uid,
                email: firebaseUser.email || 'unknown'
              }
            });
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        // Log error but allow app to continue
        logger.error(
          'Error in auth state change',
          error instanceof Error ? error : new Error('Unknown auth error'),
          { component: 'useAuthState' }
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []); // Remove firebaseUser dependency to prevent infinite loops

  return {
    user,
    firebaseUser,
    loading,
    refreshUserProfile
  };
};