/**
 * ZADIA OS - Service Worker for Offline First PWA
 * Handles caching, offline functionality, and background sync
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `zadia-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `zadia-dynamic-${CACHE_VERSION}`;
const API_CACHE = `zadia-api-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/landing/images/logo.svg'
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/clients',
  '/api/products',
  '/api/inventory'
];

// ============================================
// Install Event
// ============================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// ============================================
// Activate Event
// ============================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('zadia-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE &&
                   name !== API_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// ============================================
// Fetch Event - Network First with Cache Fallback
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other origins
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Dynamic pages - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ============================================
// Caching Strategies
// ============================================

async function networkFirstStrategy(request: Request, cacheName: string): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    
    // Clone and cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function cacheFirstStrategy(request: Request, cacheName: string): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => {
    // Return cached or offline page
    return cachedResponse || caches.match('/offline');
  });

  return cachedResponse || fetchPromise;
}

// ============================================
// Background Sync
// ============================================

interface SyncManager {
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
  }
}

self.addEventListener('sync', (event) => {
  const syncEvent = event as ExtendableEvent & { tag: string };
  
  if (syncEvent.tag === 'sync-pending-changes') {
    syncEvent.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges(): Promise<void> {
  // Get pending changes from IndexedDB
  const pendingChanges = await getPendingChanges();
  
  for (const change of pendingChanges) {
    try {
      await fetch(change.url, {
        method: change.method,
        headers: change.headers,
        body: JSON.stringify(change.body)
      });
      
      // Remove from pending
      await removePendingChange(change.id);
    } catch {
      // Will retry on next sync
    }
  }
}

// ============================================
// Push Notifications
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options: NotificationOptions = {
    body: data.body || 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ZADIA OS', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

// ============================================
// Helper Functions
// ============================================

function isStaticAsset(pathname: string): boolean {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.woff', '.woff2', '.ttf', '.ico'
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// IndexedDB helpers for pending changes
async function getPendingChanges(): Promise<Array<{
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}>> {
  return new Promise((resolve) => {
    const request = indexedDB.open('zadia-offline', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-changes')) {
        db.createObjectStore('pending-changes', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending-changes', 'readonly');
      const store = tx.objectStore('pending-changes');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        resolve([]);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removePendingChange(id: string): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.open('zadia-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending-changes', 'readwrite');
      const store = tx.objectStore('pending-changes');
      store.delete(id);
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
    
    request.onerror = () => resolve();
  });
}

export {};
