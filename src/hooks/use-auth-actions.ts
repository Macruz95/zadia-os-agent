'use client';

import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { RegisterFormData, GoogleCompleteFormData } from '@/validations/auth.schema';
import { User } from 'firebase/auth';

/**
 * Hook that handles all authentication actions
 */
export const useAuthActions = () => {
  
  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      // Create Firebase user
      const firebaseUser = await AuthService.createUserWithEmail(
        data.email, 
        data.password, 
        data.name
      );
      
      // Create user profile in Firestore
      await UserService.createUserProfile(firebaseUser, {
        language: data.language,
        organization: data.organization,
        objective: data.objective
      });
      
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      await AuthService.signInWithEmail(email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
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
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await AuthService.sendPasswordReset(email);
    } catch (error) {
      throw error;
    }
  };

  const completeGoogleProfile = async (firebaseUser: User, data: GoogleCompleteFormData): Promise<void> => {
    try {
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      // Create user profile in Firestore
      await UserService.createUserProfile(firebaseUser, {
        language: data.language,
        organization: data.organization,
        objective: data.objective
      });
      
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.signOut();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      // Re-lanzar error para manejo en el componente
      throw error;
    }
  };

  return {
    register,
    loginWithEmail,
    loginWithGoogle,
    resetPassword,
    completeGoogleProfile,
    logout
  };
};