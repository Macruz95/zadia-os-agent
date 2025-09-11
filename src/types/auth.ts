// User role types
export type UserRole = 'admin' | 'manager' | 'user';

// User objective types
export type UserObjective = 'automation' | 'analytics' | 'collaboration' | 'growth';

// Language types
export type Language = 'es' | 'en';

// Base user profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: Language;
  organization?: string;
  objective?: UserObjective;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

// Auth form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  language: Language;
  organization?: string;
  objective?: UserObjective;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface GoogleCompleteFormData {
  role: UserRole;
  language: Language;
  organization?: string;
  objective?: UserObjective;
}

// Auth context types
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeGoogleProfile: (data: GoogleCompleteFormData) => Promise<void>;
}

// Firebase error codes mapping
export interface FirebaseAuthError {
  code: string;
  message: string;
}
