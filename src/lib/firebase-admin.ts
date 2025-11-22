import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

// Initialize Firebase Admin
// Note: In production (Vercel), we should use environment variables for the service account
// For local development without service account, we might need to rely on default credentials or mock
// However, for this "Free Plan" pivot, we will try to use the standard initialization
// which works if GOOGLE_APPLICATION_CREDENTIALS is set, or if we pass the config object.

let app: App;

if (!getApps().length) {
    // Check if we have the service account key in environment variables
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } catch (error) {
            logger.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY', error as Error);
            // Fallback to default initialization (might fail locally without setup)
            app = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }
    } else {
        // Fallback for when no specific key is provided (e.g. local dev with gcloud auth)
        app = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
} else {
    app = getApps()[0];
}

export const adminDb = getFirestore(app);
