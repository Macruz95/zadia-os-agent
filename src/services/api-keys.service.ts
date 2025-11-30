/**
 * ZADIA OS - API Keys Service
 * 
 * Manage API keys for public API access
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
import { randomBytes, createHash } from 'crypto';

const API_KEYS_COLLECTION = 'apiKeys';

// ============================================
// Types
// ============================================

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string; // Hashed key, never store plain text
  keyPrefix: string; // First 8 chars for identification
  permissions: ApiPermission[];
  rateLimit: number; // Requests per minute
  lastUsedAt?: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ApiPermission = 
  | 'clients:read'
  | 'clients:write'
  | 'invoices:read'
  | 'invoices:write'
  | 'quotes:read'
  | 'quotes:write'
  | 'products:read'
  | 'products:write'
  | 'orders:read'
  | 'orders:write'
  | 'payments:read'
  | 'webhooks:manage';

export interface ApiKeyCreateInput {
  tenantId: string;
  name: string;
  permissions: ApiPermission[];
  rateLimit?: number;
  expiresAt?: Date;
  createdBy: string;
}

// ============================================
// Key Generation
// ============================================

/**
 * Generate a new API key
 * Returns the plain key (only shown once) and the hashed version
 */
function generateApiKey(): { plainKey: string; keyHash: string; keyPrefix: string } {
  // Generate 32 random bytes = 64 hex chars
  const randomPart = randomBytes(32).toString('hex');
  const plainKey = `zadia_${randomPart}`;
  const keyPrefix = plainKey.substring(0, 14); // "zadia_" + 8 chars
  const keyHash = hashApiKey(plainKey);
  
  return { plainKey, keyHash, keyPrefix };
}

/**
 * Hash an API key for storage
 */
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new API key
 * Returns the plain key - this is the only time it's available!
 */
export async function createApiKey(
  input: ApiKeyCreateInput
): Promise<{ apiKey: ApiKey; plainKey: string } | null> {
  try {
    const { plainKey, keyHash, keyPrefix } = generateApiKey();
    
    const apiKeyData = {
      tenantId: input.tenantId,
      name: input.name,
      keyHash,
      keyPrefix,
      permissions: input.permissions,
      rateLimit: input.rateLimit || 60, // Default 60 requests per minute
      expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : null,
      isActive: true,
      createdBy: input.createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, API_KEYS_COLLECTION), apiKeyData);
    
    return {
      apiKey: {
        id: docRef.id,
        ...apiKeyData,
      } as ApiKey,
      plainKey,
    };
  } catch (error) {
    logger.error('Failed to create API key', error as Error);
    return null;
  }
}

/**
 * Validate an API key and return the associated data
 */
export async function validateApiKey(
  key: string
): Promise<ApiKey | null> {
  try {
    const keyHash = hashApiKey(key);
    
    const q = query(
      collection(db, API_KEYS_COLLECTION),
      where('keyHash', '==', keyHash),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const apiKey = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as ApiKey;
    
    // Check expiration
    if (apiKey.expiresAt) {
      const expiresAt = new Date(apiKey.expiresAt.seconds * 1000);
      if (expiresAt < new Date()) {
        return null; // Expired
      }
    }
    
    // Update last used
    await updateDoc(doc(db, API_KEYS_COLLECTION, apiKey.id), {
      lastUsedAt: Timestamp.now(),
    });
    
    return apiKey;
  } catch (error) {
    logger.error('Failed to validate API key', error as Error);
    return null;
  }
}

/**
 * Get all API keys for a tenant
 */
export async function getTenantApiKeys(
  tenantId: string
): Promise<ApiKey[]> {
  try {
    const q = query(
      collection(db, API_KEYS_COLLECTION),
      where('tenantId', '==', tenantId)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ApiKey));
  } catch (error) {
    logger.error('Failed to get tenant API keys', error as Error);
    return [];
  }
}

/**
 * Update API key permissions
 */
export async function updateApiKeyPermissions(
  keyId: string,
  permissions: ApiPermission[]
): Promise<boolean> {
  try {
    await updateDoc(doc(db, API_KEYS_COLLECTION, keyId), {
      permissions,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    logger.error('Failed to update API key permissions', error as Error);
    return false;
  }
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, API_KEYS_COLLECTION, keyId), {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    logger.error('Failed to revoke API key', error as Error);
    return false;
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, API_KEYS_COLLECTION, keyId));
    return true;
  } catch (error) {
    logger.error('Failed to delete API key', error as Error);
    return false;
  }
}

/**
 * Check if API key has a specific permission
 */
export function hasPermission(
  apiKey: ApiKey,
  permission: ApiPermission
): boolean {
  return apiKey.permissions.includes(permission);
}

/**
 * Get API key by ID
 */
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
  try {
    const docRef = doc(db, API_KEYS_COLLECTION, keyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ApiKey;
  } catch (error) {
    logger.error('Failed to get API key', error as Error);
    return null;
  }
}
