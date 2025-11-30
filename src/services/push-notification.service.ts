/**
 * ZADIA OS - Push Notification Service
 * 
 * Firebase Cloud Messaging integration
 * REGLA 1: Real Firebase data
 * REGLA 4: Modular architecture
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const FCM_TOKENS_COLLECTION = 'fcmTokens';

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Messaging (client-side only)
 */
function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') return null;
  
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      logger.warn('FCM not supported in this browser', { 
        action: 'getMessagingInstance' 
      });
      return null;
    }
  }
  
  return messaging;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      logger.info('Notification permission denied', { action: 'requestPermission' });
      return null;
    }
    
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) return null;
    
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    
    if (token) {
      // Save token to Firestore
      await saveTokenToFirestore(userId, token);
      logger.info('FCM token obtained', { action: 'getToken' });
    }
    
    return token;
  } catch (error) {
    logger.error('Failed to get FCM token', error as Error);
    return null;
  }
}

/**
 * Save FCM token to Firestore
 */
async function saveTokenToFirestore(userId: string, token: string): Promise<void> {
  const tokenRef = doc(db, FCM_TOKENS_COLLECTION, `${userId}_${token.slice(-10)}`);
  
  await setDoc(tokenRef, {
    userId,
    token,
    createdAt: new Date(),
    platform: getBrowserInfo(),
    lastActive: new Date(),
  });
}

/**
 * Remove FCM token from Firestore
 */
export async function removeNotificationToken(userId: string, token: string): Promise<void> {
  const tokenRef = doc(db, FCM_TOKENS_COLLECTION, `${userId}_${token.slice(-10)}`);
  await deleteDoc(tokenRef);
}

/**
 * Get all tokens for a user
 */
export async function getUserTokens(userId: string): Promise<string[]> {
  const q = query(
    collection(db, FCM_TOKENS_COLLECTION),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().token);
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: NotificationPayload) => void): () => void {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return () => {};
  
  return onMessage(messagingInstance, (payload) => {
    callback({
      title: payload.notification?.title || 'Nueva notificación',
      body: payload.notification?.body || '',
      icon: payload.notification?.icon,
      data: payload.data,
    });
  });
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (typeof window === 'undefined') return null;
  return Notification.permission;
}

/**
 * Get browser info for token metadata
 */
function getBrowserInfo(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Safari')) return 'safari';
  if (ua.includes('Edge')) return 'edge';
  return 'other';
}

// Types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  types: {
    invoices: boolean;
    projects: boolean;
    tasks: boolean;
    inventory: boolean;
    leads: boolean;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push: true,
  email: true,
  sms: false,
  types: {
    invoices: true,
    projects: true,
    tasks: true,
    inventory: true,
    leads: true,
  },
};
