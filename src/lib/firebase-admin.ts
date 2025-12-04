import { getApps, initializeApp, cert, type AppOptions, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin initialization (server-side only)
 * Parses FIREBASE_SERVICE_ACCOUNT_KEY JSON from environment.
 * Uses lazy initialization to avoid build-time errors.
 */

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;
let _initFailed = false;

function initializeAdminApp(): App | null {
  if (_initFailed) {
    return null;
  }
  
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountJson) {
    // In development, allow app to run without server-side auth validation
    if (process.env.NODE_ENV === 'development') {
      console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY not set - server-side auth validation disabled');
      _initFailed = true;
      return null;
    }
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required for server-side auth validation');
  }
  
  let appOptions: AppOptions;
  try {
    const credentials = JSON.parse(serviceAccountJson);
    appOptions = { credential: cert(credentials) };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[firebase-admin] Invalid FIREBASE_SERVICE_ACCOUNT_KEY - server-side auth validation disabled');
      _initFailed = true;
      return null;
    }
    throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON: ${String(error)}`);
  }
  
  return initializeApp(appOptions);
}

/**
 * Get the Firebase Admin App instance (lazy initialization)
 * Returns null if initialization failed (e.g., missing credentials in dev)
 */
export function getAdminApp(): App | null {
  if (_adminApp === null && !_initFailed) {
    _adminApp = initializeAdminApp();
  }
  return _adminApp;
}

/**
 * Get the Firebase Admin Auth instance (lazy initialization)
 * Returns null if admin app is not available
 */
export function getAdminAuth(): Auth | null {
  if (_adminAuth === null) {
    const app = getAdminApp();
    if (app) {
      _adminAuth = getAuth(app);
    }
  }
  return _adminAuth;
}

/**
 * Get the Firebase Admin Firestore instance (lazy initialization)
 * Returns null if admin app is not available
 */
export function getAdminDb(): Firestore | null {
  if (_adminDb === null) {
    const app = getAdminApp();
    if (app) {
      _adminDb = getFirestore(app);
    }
  }
  return _adminDb;
}

/**
 * Check if Firebase Admin is available
 */
export function isAdminAvailable(): boolean {
  return getAdminApp() !== null;
}

// Proxy objects for backwards compatibility
// These allow using adminAuth/adminDb as if they were directly initialized
// Will throw helpful errors if admin is not available
export const adminApp = new Proxy({} as App, {
  get(_, prop) {
    const app = getAdminApp();
    if (!app) {
      throw new Error('Firebase Admin not available - FIREBASE_SERVICE_ACCOUNT_KEY not configured');
    }
    return (app as unknown as Record<string, unknown>)[prop as string];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const auth = getAdminAuth();
    if (!auth) {
      throw new Error('Firebase Admin Auth not available - FIREBASE_SERVICE_ACCOUNT_KEY not configured');
    }
    const value = (auth as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(auth);
    }
    return value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const db = getAdminDb();
    if (!db) {
      throw new Error('Firebase Admin Firestore not available - FIREBASE_SERVICE_ACCOUNT_KEY not configured');
    }
    const value = (db as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
});
