'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user.service';
import { UserProfile } from '@/validations/auth.schema';

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
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Update last login
          await UserService.updateLastLogin(firebaseUser.uid);
          
          // Get user profile from Firestore
          const userProfile = await UserService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return {
    user,
    firebaseUser,
    loading,
    refreshUserProfile
  };
};