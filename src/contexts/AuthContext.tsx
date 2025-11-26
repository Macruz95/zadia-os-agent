'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { User as FirebaseUser, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile, RegisterFormData, GoogleCompleteFormData } from '@/validations/auth.schema';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/use-auth-actions';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  register: (data: RegisterFormData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  resetPassword: (email: string) => Promise<void>;
  completeGoogleProfile: (data: GoogleCompleteFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sync Firebase auth state with HTTP-only cookie for middleware protection
 */
function useAuthCookieSync() {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } else {
          await fetch('/api/auth/session', { method: 'DELETE' });
        }
      } catch {
        // Silently fail - cookie sync is non-critical
      }
    });

    return () => unsubscribe();
  }, []);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading, refreshUserProfile } = useAuthState();
  const authActions = useAuthActions();

  // Sync auth state with cookie for middleware
  useAuthCookieSync();

  const completeGoogleProfile = async (data: GoogleCompleteFormData): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('No authenticated user found');
    }
    
    await authActions.completeGoogleProfile(firebaseUser, data);
    await refreshUserProfile();
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    register: authActions.register,
    login: authActions.loginWithEmail,
    loginWithGoogle: authActions.loginWithGoogle,
    resetPassword: authActions.resetPassword,
    completeGoogleProfile,
    logout: authActions.logout,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
