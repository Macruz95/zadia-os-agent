'use client';

import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { 
  UserProfile, 
  RegisterFormData, 
  GoogleCompleteFormData 
} from '@/validations/auth.schema';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeGoogleProfile: (data: GoogleCompleteFormData) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Update last login
          await UserService.updateLastLogin(firebaseUser.uid);
          
          // Get user profile from Firestore
          const userProfile = await UserService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.signInWithEmail(email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      setLoading(true);
      
      // Create Firebase user
      const firebaseUser = await AuthService.createUserWithEmail(
        data.email, 
        data.password, 
        data.name
      );
      
      // Create user profile in Firestore
      await UserService.createUserProfile(firebaseUser, {
        role: 'user', // Default role assigned server-side
        language: data.language,
        organization: data.organization,
        objective: data.objective
      });
      
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      setLoading(true);
      const firebaseUser = await AuthService.signInWithGoogle();
      
      // Check if user profile exists in Firestore
      const profileExists = await UserService.userProfileExists(firebaseUser.uid);
      
      if (!profileExists) {
        // User needs to complete profile - don't update context yet
        return firebaseUser;
      }
      
      // User state will be updated by onAuthStateChanged
      return firebaseUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await AuthService.sendPasswordReset(email);
    } catch (error) {
      throw error;
    }
  };

  const completeGoogleProfile = async (data: GoogleCompleteFormData): Promise<void> => {
    try {
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      setLoading(true);
      
      // Create user profile in Firestore
      await UserService.createUserProfile(firebaseUser, {
        role: 'user', // Default role assigned server-side
        language: data.language,
        organization: data.organization,
        objective: data.objective
      });
      
      // Refresh user profile
      await refreshUserProfile();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (!firebaseUser) return;
      
      const userProfile = await UserService.getUserProfile(firebaseUser.uid);
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    completeGoogleProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
