// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Check if we're in a browser environment or if config is available
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only if config is valid and not already initialized
let app: FirebaseApp;
if (isConfigValid) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else if (typeof window !== 'undefined') {
  // Only warn in browser environment
  // eslint-disable-next-line no-console
  console.warn('Firebase configuration is incomplete. Check your environment variables.');
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else {
  // SSR/Build time - create a placeholder app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

// Initialize Firestore for the DTO (Gemelo Digital de la Organización)
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
