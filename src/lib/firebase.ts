// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
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
if (getApps().length > 0) {
  // Already initialized - reuse existing app
  app = getApp();
} else if (isConfigValid) {
  // Valid config - initialize normally
  app = initializeApp(firebaseConfig);
} else {
  // Invalid config (build time, SSR, or missing env vars)
  // Initialize with empty config - will fail at runtime if accessed
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('Firebase configuration is incomplete. Check your environment variables.');
  }
  app = initializeApp(firebaseConfig);
}

// Initialize Firestore for the DTO (Gemelo Digital de la Organización)
export const db = getFirestore(app);

// Initialize Firebase Auth with LOCAL persistence
// This ensures the session survives browser close/reopen
export const auth = getAuth(app);

// Set persistence to LOCAL (indexedDB/localStorage) so session persists across browser restarts
// This runs only in the browser; on the server it's a no-op
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Silently fail - auth will still work, just might not persist
  });
}

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
