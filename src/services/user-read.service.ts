import { 
  doc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, userProfileSchema } from '@/validations/auth.schema';
import { handleUserError } from './user.utils';

/**
 * User Read Service
 * Handles user profile reading operations
 */
export class UserReadService {

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
      throw handleUserError(error);
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
}