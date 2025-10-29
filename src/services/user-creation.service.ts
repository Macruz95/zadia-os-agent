import { 
  doc, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/validations/auth.schema';
import { User } from 'firebase/auth';
import { handleUserError } from './user.utils';

/**
 * User Creation Service
 * Handles user profile creation in Firestore
 */
export class UserCreationService {

  /**
   * Create user profile document in Firestore
   */
  static async createUserProfile(
    user: User,
    additionalData: {
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
      throw handleUserError(error);
    }
  }
}