import { 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/validations/auth.schema';
import { handleUserError } from './user.utils';

/**
 * User Update Service
 * Handles user profile update operations
 */
export class UserUpdateService {

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
      throw handleUserError(error);
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
      throw handleUserError(error);
    }
  }
}