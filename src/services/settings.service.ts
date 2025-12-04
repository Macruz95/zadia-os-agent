/**
 * ZADIA OS - Settings Service
 * 
 * Manages all settings-related operations with Firebase
 * REGLA 1: Real Firebase data, no mocks
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// ============================================
// TYPES
// ============================================

export interface OrganizationInfo {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  // Extended info
  industry?: string;
  employeeCount?: string;
  foundedYear?: string;
  website?: string;
  // Contact info
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  // Logo
  logoUrl?: string;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RegionalSettings {
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  locale?: string;
}

export interface NotificationPreferences {
  userId: string;
  tenantId: string;
  // Global settings
  enableAll: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  digestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  // Categories
  categories: {
    [key: string]: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  updatedAt: Timestamp;
}

export interface SecuritySettings {
  userId: string;
  tenantId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  twoFactorSecret?: string;
  loginAlerts: boolean;
  passwordLastChanged: Timestamp;
  sessionTimeout: number; // minutes
  ipRestriction: boolean;
  allowedIPs: string[];
  updatedAt: Timestamp;
}

export interface ActiveSession {
  id: string;
  userId: string;
  tenantId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  userAgent: string;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  isCurrent: boolean;
}

export interface IntegrationConfig {
  id: string;
  tenantId: string;
  integrationId: string;
  name: string;
  connected: boolean;
  credentials?: {
    clientId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Timestamp;
  };
  settings?: Record<string, unknown>;
  lastSyncAt?: Timestamp;
  syncStatus?: 'success' | 'error' | 'pending';
  syncError?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt?: Timestamp;
  failureCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string; // First 8 chars for display
  keyHash: string; // Hashed full key
  permissions: string[];
  lastUsedAt?: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}

// ============================================
// ORGANIZATION SETTINGS
// ============================================

const ORGANIZATION_COLLECTION = 'organization-settings';

export async function getOrganizationInfo(tenantId: string): Promise<OrganizationInfo | null> {
  try {
    const docRef = doc(db, ORGANIZATION_COLLECTION, tenantId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as OrganizationInfo;
  } catch (error) {
    logger.error('Failed to get organization info', error as Error);
    throw error;
  }
}

export async function updateOrganizationInfo(
  tenantId: string,
  data: Partial<Omit<OrganizationInfo, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, ORGANIZATION_COLLECTION, tenantId);
    const existing = await getDoc(docRef);
    
    if (existing.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        tenantId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    logger.info('Organization info updated', { tenantId });
  } catch (error) {
    logger.error('Failed to update organization info', error as Error);
    throw error;
  }
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

const NOTIFICATION_PREFS_COLLECTION = 'notification-preferences';

const DEFAULT_NOTIFICATION_PREFS: Omit<NotificationPreferences, 'userId' | 'tenantId' | 'updatedAt'> = {
  enableAll: true,
  soundEnabled: true,
  desktopNotifications: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  digestFrequency: 'instant',
  categories: {
    sales: { email: true, push: true, inApp: true },
    invoices: { email: true, push: true, inApp: true },
    projects: { email: true, push: false, inApp: true },
    inventory: { email: true, push: true, inApp: true },
    team: { email: false, push: true, inApp: true },
    system: { email: true, push: false, inApp: true },
  },
};

export async function getNotificationPreferences(
  userId: string,
  tenantId: string
): Promise<NotificationPreferences> {
  try {
    const docId = `${tenantId}_${userId}`;
    const docRef = doc(db, NOTIFICATION_PREFS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Return defaults
      return {
        ...DEFAULT_NOTIFICATION_PREFS,
        userId,
        tenantId,
        updatedAt: Timestamp.now(),
      };
    }
    
    return docSnap.data() as NotificationPreferences;
  } catch (error) {
    logger.error('Failed to get notification preferences', error as Error);
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      userId,
      tenantId,
      updatedAt: Timestamp.now(),
    };
  }
}

export async function updateNotificationPreferences(
  userId: string,
  tenantId: string,
  data: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const docId = `${tenantId}_${userId}`;
    const docRef = doc(db, NOTIFICATION_PREFS_COLLECTION, docId);
    const existing = await getDoc(docRef);
    
    if (existing.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...data,
        userId,
        tenantId,
        updatedAt: serverTimestamp(),
      });
    }
    
    logger.info('Notification preferences updated', { userId, tenantId });
  } catch (error) {
    logger.error('Failed to update notification preferences', error as Error);
    throw error;
  }
}

// ============================================
// SECURITY SETTINGS
// ============================================

const SECURITY_SETTINGS_COLLECTION = 'security-settings';

export async function getSecuritySettings(
  userId: string,
  tenantId: string
): Promise<SecuritySettings | null> {
  try {
    const docId = `${tenantId}_${userId}`;
    const docRef = doc(db, SECURITY_SETTINGS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as SecuritySettings;
  } catch (error) {
    logger.error('Failed to get security settings', error as Error);
    throw error;
  }
}

export async function updateSecuritySettings(
  userId: string,
  tenantId: string,
  data: Partial<SecuritySettings>
): Promise<void> {
  try {
    const docId = `${tenantId}_${userId}`;
    const docRef = doc(db, SECURITY_SETTINGS_COLLECTION, docId);
    const existing = await getDoc(docRef);
    
    if (existing.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        tenantId,
        twoFactorEnabled: false,
        loginAlerts: true,
        passwordLastChanged: serverTimestamp(),
        sessionTimeout: 30,
        ipRestriction: false,
        allowedIPs: [],
        ...data,
        updatedAt: serverTimestamp(),
      });
    }
    
    logger.info('Security settings updated', { userId, tenantId });
  } catch (error) {
    logger.error('Failed to update security settings', error as Error);
    throw error;
  }
}

// ============================================
// ACTIVE SESSIONS
// ============================================

const SESSIONS_COLLECTION = 'active-sessions';

export async function getActiveSessions(
  userId: string,
  tenantId: string
): Promise<ActiveSession[]> {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      orderBy('lastActiveAt', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ActiveSession);
  } catch (error) {
    logger.error('Failed to get active sessions', error as Error);
    return [];
  }
}

export async function createSession(
  userId: string,
  tenantId: string,
  sessionData: Omit<ActiveSession, 'id' | 'userId' | 'tenantId' | 'createdAt' | 'lastActiveAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, SESSIONS_COLLECTION));
    
    await setDoc(docRef, {
      userId,
      tenantId,
      ...sessionData,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    logger.error('Failed to create session', error as Error);
    throw error;
  }
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Failed to update session activity', error as Error);
  }
}

export async function revokeSession(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
    logger.info('Session revoked', { sessionId });
  } catch (error) {
    logger.error('Failed to revoke session', error as Error);
    throw error;
  }
}

export async function revokeAllSessions(
  userId: string,
  tenantId: string,
  exceptSessionId?: string
): Promise<void> {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs
      .filter(doc => doc.id !== exceptSessionId)
      .map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    logger.info('All sessions revoked', { userId, tenantId });
  } catch (error) {
    logger.error('Failed to revoke all sessions', error as Error);
    throw error;
  }
}

// ============================================
// INTEGRATIONS
// ============================================

const INTEGRATIONS_COLLECTION = 'integration-configs';

export async function getIntegrations(tenantId: string): Promise<IntegrationConfig[]> {
  try {
    const q = query(
      collection(db, INTEGRATIONS_COLLECTION),
      where('tenantId', '==', tenantId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as IntegrationConfig);
  } catch (error) {
    logger.error('Failed to get integrations', error as Error);
    return [];
  }
}

export async function getIntegration(
  tenantId: string,
  integrationId: string
): Promise<IntegrationConfig | null> {
  try {
    const q = query(
      collection(db, INTEGRATIONS_COLLECTION),
      where('tenantId', '==', tenantId),
      where('integrationId', '==', integrationId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as IntegrationConfig;
  } catch (error) {
    logger.error('Failed to get integration', error as Error);
    return null;
  }
}

export async function connectIntegration(
  tenantId: string,
  integrationId: string,
  name: string,
  credentials: IntegrationConfig['credentials']
): Promise<string> {
  try {
    const docRef = doc(collection(db, INTEGRATIONS_COLLECTION));
    
    await setDoc(docRef, {
      tenantId,
      integrationId,
      name,
      connected: true,
      credentials,
      syncStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    logger.info('Integration connected', { tenantId, integrationId });
    return docRef.id;
  } catch (error) {
    logger.error('Failed to connect integration', error as Error);
    throw error;
  }
}

export async function disconnectIntegration(
  tenantId: string,
  integrationId: string
): Promise<void> {
  try {
    const integration = await getIntegration(tenantId, integrationId);
    if (!integration) return;
    
    await deleteDoc(doc(db, INTEGRATIONS_COLLECTION, integration.id));
    logger.info('Integration disconnected', { tenantId, integrationId });
  } catch (error) {
    logger.error('Failed to disconnect integration', error as Error);
    throw error;
  }
}

export async function updateIntegrationSync(
  configId: string,
  status: 'success' | 'error',
  error?: string
): Promise<void> {
  try {
    const docRef = doc(db, INTEGRATIONS_COLLECTION, configId);
    await updateDoc(docRef, {
      lastSyncAt: serverTimestamp(),
      syncStatus: status,
      syncError: error || null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Failed to update integration sync', error as Error);
  }
}

// ============================================
// WEBHOOKS
// ============================================

const WEBHOOKS_COLLECTION = 'webhooks';

export async function getWebhooks(tenantId: string): Promise<WebhookEndpoint[]> {
  try {
    const q = query(
      collection(db, WEBHOOKS_COLLECTION),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WebhookEndpoint);
  } catch (error) {
    logger.error('Failed to get webhooks', error as Error);
    return [];
  }
}

export async function createWebhook(
  tenantId: string,
  data: Omit<WebhookEndpoint, 'id' | 'tenantId' | 'secret' | 'failureCount' | 'createdAt' | 'updatedAt'>
): Promise<WebhookEndpoint> {
  try {
    const docRef = doc(collection(db, WEBHOOKS_COLLECTION));
    const secret = `whsec_${generateRandomString(32)}`;
    
    const webhook: Omit<WebhookEndpoint, 'id'> = {
      tenantId,
      ...data,
      secret,
      failureCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(docRef, webhook);
    
    logger.info('Webhook created', { tenantId, webhookId: docRef.id });
    return { id: docRef.id, ...webhook };
  } catch (error) {
    logger.error('Failed to create webhook', error as Error);
    throw error;
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, WEBHOOKS_COLLECTION, webhookId));
    logger.info('Webhook deleted', { webhookId });
  } catch (error) {
    logger.error('Failed to delete webhook', error as Error);
    throw error;
  }
}

// ============================================
// API KEYS
// ============================================

const API_KEYS_COLLECTION = 'api-keys';

export async function getApiKeys(tenantId: string): Promise<ApiKey[]> {
  try {
    const q = query(
      collection(db, API_KEYS_COLLECTION),
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ApiKey);
  } catch (error) {
    logger.error('Failed to get API keys', error as Error);
    return [];
  }
}

export async function createApiKey(
  tenantId: string,
  name: string,
  permissions: string[]
): Promise<{ key: string; apiKey: ApiKey }> {
  try {
    const fullKey = `zadia_${generateRandomString(40)}`;
    const keyPrefix = fullKey.substring(0, 12);
    const keyHash = await hashString(fullKey);
    
    const docRef = doc(collection(db, API_KEYS_COLLECTION));
    
    const apiKey: Omit<ApiKey, 'id'> = {
      tenantId,
      name,
      keyPrefix,
      keyHash,
      permissions,
      isActive: true,
      createdAt: Timestamp.now(),
    };
    
    await setDoc(docRef, apiKey);
    
    logger.info('API key created', { tenantId, keyId: docRef.id });
    return { key: fullKey, apiKey: { id: docRef.id, ...apiKey } };
  } catch (error) {
    logger.error('Failed to create API key', error as Error);
    throw error;
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    const docRef = doc(db, API_KEYS_COLLECTION, keyId);
    await updateDoc(docRef, {
      isActive: false,
    });
    logger.info('API key revoked', { keyId });
  } catch (error) {
    logger.error('Failed to revoke API key', error as Error);
    throw error;
  }
}

// ============================================
// HELPERS
// ============================================

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToNotificationPreferences(
  userId: string,
  tenantId: string,
  callback: (prefs: NotificationPreferences) => void
): () => void {
  const docId = `${tenantId}_${userId}`;
  const docRef = doc(db, NOTIFICATION_PREFS_COLLECTION, docId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as NotificationPreferences);
    } else {
      callback({
        ...DEFAULT_NOTIFICATION_PREFS,
        userId,
        tenantId,
        updatedAt: Timestamp.now(),
      });
    }
  });
}

export function subscribeToIntegrations(
  tenantId: string,
  callback: (integrations: IntegrationConfig[]) => void
): () => void {
  const q = query(
    collection(db, INTEGRATIONS_COLLECTION),
    where('tenantId', '==', tenantId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const integrations = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as IntegrationConfig);
    callback(integrations);
  });
}
