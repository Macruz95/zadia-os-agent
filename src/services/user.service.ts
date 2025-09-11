import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, userProfileSchema } from '@/validations/auth.schema';
import { User } from 'firebase/auth';

/**
 * User Data Service
 * Handles user profile operations with Firestore
 */
export class UserService {

  /**
   * Create user profile document in Firestore
   */
  static async createUserProfile(
    user: User,
    additionalData: {
      role: UserProfile['role'];
      language: UserProfile['language'];
      organization?: string;
      objective?: UserProfile['objective'];
    }
  ): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      const userData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split('@')[0],
        role: additionalData.role,
        language: additionalData.language,
        organization: additionalData.organization,
        objective: additionalData.objective,
        isActive: true
      };

      // Create the document data, only including photoURL if it exists
      const docData = {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      } as Record<string, unknown>;

      // Only include photoURL if it exists and is not null/undefined
      if (user.photoURL) {
        docData.photoURL = user.photoURL;
      }

      await setDoc(userRef, docData);
      
      // Return user profile with current date (for immediate use)
      return {
        ...userData,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLogin: new Date()
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Get user profile by UID
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      const userData = userSnap.data();
      
      // Convert Firestore timestamps to Date objects
      const profile = {
        ...userData,
        createdAt: userData.createdAt instanceof Timestamp 
          ? userData.createdAt.toDate() 
          : new Date(),
        lastLogin: userData.lastLogin instanceof Timestamp 
          ? userData.lastLogin.toDate() 
          : new Date()
      };
      
      // Validate data structure with Zod
      return userProfileSchema.parse(profile);
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    uid: string, 
    updateData: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'lastLogin'>>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        ...updateData,
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      // Check if document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn(`User document ${uid} does not exist, skipping lastLogin update`);
        return;
      }
      
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for lastLogin update failures
    }
  }

  /**
   * Check if user profile exists in Firestore
   */
  static async userProfileExists(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      return userSnap.exists();
    } catch {
      return false;
    }
  }

  /**
   * Deactivate user account (soft delete)
   */
  static async deactivateUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isActive: false,
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Handle Firestore errors and convert to user-friendly messages
   */
  private static handleUserError(error: unknown): Error {
    console.error('UserService error:', error);
    
    if (error instanceof Error) {
      // If it's a Zod validation error, return specific message
      if (error.message.includes('validation')) {
        return new Error('Invalid user data format');
      }
    }
    
    return new Error('Failed to process user data');
  }
}
