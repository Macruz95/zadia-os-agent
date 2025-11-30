/**
 * ZADIA OS - Offline Sync Service
 * Handles offline data storage and synchronization
 */

import { openDB, IDBPDatabase } from 'idb';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface PendingChange {
  id: string;
  collection: string;
  documentId: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  userId: string;
  tenantId: string;
}

interface CachedDocument {
  id: string;
  collection: string;
  data: Record<string, unknown>;
  cachedAt: number;
  expiresAt: number;
}

interface SyncStatus {
  lastSyncAt: number | null;
  pendingChanges: number;
  isSyncing: boolean;
  isOnline: boolean;
}

// ============================================
// IndexedDB Setup
// ============================================

const DB_NAME = 'zadia-offline';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pending changes store
      if (!db.objectStoreNames.contains('pending-changes')) {
        const pendingStore = db.createObjectStore('pending-changes', { keyPath: 'id' });
        pendingStore.createIndex('by-collection', 'collection');
        pendingStore.createIndex('by-timestamp', 'timestamp');
      }

      // Cached documents store
      if (!db.objectStoreNames.contains('cached-documents')) {
        const cacheStore = db.createObjectStore('cached-documents', { keyPath: 'id' });
        cacheStore.createIndex('by-collection', 'collection');
        cacheStore.createIndex('by-expires', 'expiresAt');
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('sync-metadata')) {
        db.createObjectStore('sync-metadata', { keyPath: 'key' });
      }
    }
  });
}

// ============================================
// Offline Sync Service
// ============================================

export class OfflineSyncService {
  private static syncInProgress = false;
  private static listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * Initialize offline sync
   */
  static async initialize(): Promise<void> {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        logger.info('Service Worker registered', {
          component: 'OfflineSyncService',
          metadata: { scope: registration.scope }
        });
      } catch (error) {
        logger.error('Service Worker registration failed', error as Error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Initial sync if online
    if (navigator.onLine) {
      await this.sync();
    }
  }

  /**
   * Queue a change for sync
   */
  static async queueChange(change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const db = await getDB();
    
    const pendingChange: PendingChange = {
      ...change,
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    await db.add('pending-changes', pendingChange);
    this.notifyListeners();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }

    return pendingChange.id;
  }

  /**
   * Cache a document for offline access
   */
  static async cacheDocument(
    collection: string,
    documentId: string,
    data: Record<string, unknown>,
    ttlMinutes = 60
  ): Promise<void> {
    const db = await getDB();
    
    const cached: CachedDocument = {
      id: `${collection}/${documentId}`,
      collection,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };

    await db.put('cached-documents', cached);
  }

  /**
   * Get cached document
   */
  static async getCached(collection: string, documentId: string): Promise<Record<string, unknown> | null> {
    const db = await getDB();
    const cached = await db.get('cached-documents', `${collection}/${documentId}`);
    
    if (!cached) return null;
    
    // Check if expired
    if (cached.expiresAt < Date.now()) {
      await db.delete('cached-documents', cached.id);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Get all cached documents for a collection
   */
  static async getCachedCollection(collection: string): Promise<Array<Record<string, unknown>>> {
    const db = await getDB();
    const tx = db.transaction('cached-documents', 'readonly');
    const index = tx.store.index('by-collection');
    const cached = await index.getAll(collection);
    
    const now = Date.now();
    return cached
      .filter(doc => doc.expiresAt > now)
      .map(doc => doc.data);
  }

  /**
   * Sync pending changes with server
   */
  static async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const db = await getDB();
      const pendingChanges = await db.getAll('pending-changes');
      
      // Sort by timestamp
      pendingChanges.sort((a, b) => a.timestamp - b.timestamp);

      for (const change of pendingChanges) {
        try {
          await this.syncChange(change);
          await db.delete('pending-changes', change.id);
        } catch (error) {
          // Increment retry count
          change.retryCount++;
          
          if (change.retryCount >= 3) {
            // Move to failed changes (could be a separate store)
            logger.error('Change sync failed permanently', error as Error, {
              component: 'OfflineSyncService',
              metadata: { changeId: change.id }
            });
            await db.delete('pending-changes', change.id);
          } else {
            await db.put('pending-changes', change);
          }
        }
      }

      // Update last sync timestamp
      await db.put('sync-metadata', {
        key: 'lastSync',
        timestamp: Date.now()
      });

    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync a single change to the server
   */
  private static async syncChange(change: PendingChange): Promise<void> {
    const endpoint = `/api/${change.collection}/${change.documentId || ''}`;
    
    const methods: Record<string, string> = {
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE'
    };

    const response = await fetch(endpoint, {
      method: methods[change.operation],
      headers: {
        'Content-Type': 'application/json'
      },
      body: change.operation !== 'delete' ? JSON.stringify(change.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
  }

  /**
   * Get sync status
   */
  static async getStatus(): Promise<SyncStatus> {
    const db = await getDB();
    const pendingChanges = await db.count('pending-changes');
    const lastSyncMeta = await db.get('sync-metadata', 'lastSync');

    return {
      lastSyncAt: lastSyncMeta?.timestamp || null,
      pendingChanges,
      isSyncing: this.syncInProgress,
      isOnline: navigator.onLine
    };
  }

  /**
   * Subscribe to sync status changes
   */
  static subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private static async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Handle coming online
   */
  private static async handleOnline(): Promise<void> {
    logger.info('Device came online, syncing...', {
      component: 'OfflineSyncService'
    });
    this.notifyListeners();
    await this.sync();
  }

  /**
   * Handle going offline
   */
  private static handleOffline(): void {
    logger.info('Device went offline', {
      component: 'OfflineSyncService'
    });
    this.notifyListeners();
  }

  /**
   * Clear all cached data
   */
  static async clearCache(): Promise<void> {
    const db = await getDB();
    await db.clear('cached-documents');
    logger.info('Cache cleared', { component: 'OfflineSyncService' });
  }

  /**
   * Clear expired cached documents
   */
  static async cleanupExpired(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('cached-documents', 'readwrite');
    const index = tx.store.index('by-expires');
    const expired = await index.getAll(IDBKeyRange.upperBound(Date.now()));
    
    for (const doc of expired) {
      await tx.store.delete(doc.id);
    }
    
    await tx.done;
  }
}

export default OfflineSyncService;
