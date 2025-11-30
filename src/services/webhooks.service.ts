/**
 * ZADIA OS - Webhooks Service
 * 
 * Manage and trigger webhooks for system events
 * REGLA 1: Real Firebase data
 * REGLA 4: Modular architecture
 */

import { 
  collection, 
  addDoc, 
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const WEBHOOKS_COLLECTION = 'webhooks';
const WEBHOOK_LOGS_COLLECTION = 'webhookLogs';

// ============================================
// Types
// ============================================

export type WebhookEvent = 
  | 'client.created'
  | 'client.updated'
  | 'client.deleted'
  | 'invoice.created'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'quote.created'
  | 'quote.sent'
  | 'quote.accepted'
  | 'quote.rejected'
  | 'payment.received'
  | 'payment.failed'
  | 'order.created'
  | 'order.completed'
  | 'inventory.low_stock';

export interface Webhook {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  headers?: Record<string, string>;
  failureCount: number;
  lastTriggeredAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  tenantId: string;
  event: WebhookEvent;
  url: string;
  requestBody: string;
  responseStatus: number;
  responseBody?: string;
  success: boolean;
  duration: number; // milliseconds
  error?: string;
  createdAt: Timestamp;
}

// ============================================
// Webhook CRUD
// ============================================

/**
 * Create a new webhook
 */
export async function createWebhook(data: {
  tenantId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
}): Promise<Webhook | null> {
  try {
    // Generate secret for signature verification
    const secret = `whsec_${generateRandomString(32)}`;
    
    const webhookData = {
      tenantId: data.tenantId,
      name: data.name,
      url: data.url,
      events: data.events,
      secret,
      isActive: true,
      headers: data.headers || {},
      failureCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, WEBHOOKS_COLLECTION), webhookData);
    
    return {
      id: docRef.id,
      ...webhookData,
    };
  } catch (error) {
    logger.error('Failed to create webhook', error as Error);
    return null;
  }
}

/**
 * Get webhooks for a tenant
 */
export async function getTenantWebhooks(tenantId: string): Promise<Webhook[]> {
  try {
    const q = query(
      collection(db, WEBHOOKS_COLLECTION),
      where('tenantId', '==', tenantId)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Webhook));
  } catch (error) {
    logger.error('Failed to get tenant webhooks', error as Error);
    return [];
  }
}

/**
 * Update webhook
 */
export async function updateWebhook(
  webhookId: string,
  updates: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'isActive' | 'headers'>>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, WEBHOOKS_COLLECTION, webhookId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    logger.error('Failed to update webhook', error as Error);
    return false;
  }
}

/**
 * Delete webhook
 */
export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, WEBHOOKS_COLLECTION, webhookId));
    return true;
  } catch (error) {
    logger.error('Failed to delete webhook', error as Error);
    return false;
  }
}

/**
 * Get webhook by ID
 */
export async function getWebhook(webhookId: string): Promise<Webhook | null> {
  try {
    const docRef = doc(db, WEBHOOKS_COLLECTION, webhookId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Webhook;
  } catch (error) {
    logger.error('Failed to get webhook', error as Error);
    return null;
  }
}

// ============================================
// Trigger Webhooks
// ============================================

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(
  tenantId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    // Get all active webhooks for this tenant and event
    const q = query(
      collection(db, WEBHOOKS_COLLECTION),
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      where('events', 'array-contains', event)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    // Trigger each webhook
    const webhooks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Webhook));
    
    await Promise.all(webhooks.map(webhook => 
      deliverWebhook(webhook, event, payload)
    ));
  } catch (error) {
    logger.error('Failed to trigger webhooks', error as Error);
  }
}

/**
 * Deliver a single webhook
 */
async function deliverWebhook(
  webhook: Webhook,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const startTime = Date.now();
  
  const body = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  });
  
  // Create signature
  const signature = await createSignature(body, webhook.secret);
  
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': String(Date.now()),
        ...webhook.headers,
      },
      body,
    });
    
    const duration = Date.now() - startTime;
    const responseBody = await response.text();
    
    // Log the webhook delivery
    await logWebhookDelivery({
      webhookId: webhook.id,
      tenantId: webhook.tenantId,
      event,
      url: webhook.url,
      requestBody: body,
      responseStatus: response.status,
      responseBody: responseBody.substring(0, 1000), // Limit response body
      success: response.ok,
      duration,
    });
    
    // Update webhook stats
    await updateDoc(doc(db, WEBHOOKS_COLLECTION, webhook.id), {
      lastTriggeredAt: Timestamp.now(),
      failureCount: response.ok ? 0 : webhook.failureCount + 1,
    });
    
    // Disable webhook after 5 consecutive failures
    if (!response.ok && webhook.failureCount >= 4) {
      await updateDoc(doc(db, WEBHOOKS_COLLECTION, webhook.id), {
        isActive: false,
      });
      logger.warn(`Webhook ${webhook.id} disabled after 5 consecutive failures`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await logWebhookDelivery({
      webhookId: webhook.id,
      tenantId: webhook.tenantId,
      event,
      url: webhook.url,
      requestBody: body,
      responseStatus: 0,
      success: false,
      duration,
      error: (error as Error).message,
    });
    
    await updateDoc(doc(db, WEBHOOKS_COLLECTION, webhook.id), {
      failureCount: webhook.failureCount + 1,
    });
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(data: Omit<WebhookLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, WEBHOOK_LOGS_COLLECTION), {
      ...data,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    logger.error('Failed to log webhook delivery', error as Error);
  }
}

/**
 * Get webhook logs
 */
export async function getWebhookLogs(
  webhookId: string,
  limitCount: number = 50
): Promise<WebhookLog[]> {
  try {
    const q = query(
      collection(db, WEBHOOK_LOGS_COLLECTION),
      where('webhookId', '==', webhookId),
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as WebhookLog))
      .slice(0, limitCount);
  } catch (error) {
    logger.error('Failed to get webhook logs', error as Error);
    return [];
  }
}

// ============================================
// Helpers
// ============================================

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = encoder.encode(secret);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
