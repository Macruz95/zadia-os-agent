import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

/**
 * Firebase Authentication Service
 * Handles user authentication operations with Firebase Auth
 */
export class AuthService {
  
  /**
   * Sign in user with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create new user account with email and password
   */
  static async createUserWithEmail(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName
      });
      
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google OAuth provider
   */
  static async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Handle Firebase Auth errors and convert to user-friendly messages
   */
  private static handleAuthError(error: unknown): Error {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return new Error('auth.errors.invalidCredentials');
        case 'auth/email-already-in-use':
          return new Error('auth.errors.emailAlreadyInUse');
        case 'auth/weak-password':
          return new Error('auth.errors.weakPassword');
        case 'auth/user-disabled':
          return new Error('auth.errors.userDisabled');
        case 'auth/too-many-requests':
          return new Error('auth.errors.tooManyRequests');
        case 'auth/popup-closed-by-user':
          return new Error('auth.errors.popupClosed');
        default:
          return new Error('auth.errors.generic');
      }
    }
    
    return new Error('auth.errors.generic');
  }
}
