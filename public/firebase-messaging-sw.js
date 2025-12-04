/**
 * ZADIA OS - Firebase Messaging Service Worker
 * 
 * Handles background push notifications
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  // eslint-disable-next-line no-console
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'ZADIA OS';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.tag || 'zadia-notification',
    data: payload.data,
    actions: getNotificationActions(payload.data?.type),
    vibrate: [100, 50, 100],
    requireInteraction: payload.data?.priority === 'high',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  // eslint-disable-next-line no-console
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  let url = '/dashboard';
  
  // Navigate based on notification type
  if (data?.type) {
    switch (data.type) {
      case 'invoice':
        url = `/finance/invoices/${data.id}`;
        break;
      case 'project':
        url = `/projects/${data.id}`;
        break;
      case 'task':
        url = `/tasks`;
        break;
      case 'lead':
        url = `/sales/leads/${data.id}`;
        break;
      case 'inventory':
        url = `/inventory`;
        break;
      default:
        url = data.url || '/dashboard';
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'invoice':
      return [
        { action: 'view', title: 'Ver factura' },
        { action: 'dismiss', title: 'Descartar' },
      ];
    case 'task':
      return [
        { action: 'complete', title: 'Completar' },
        { action: 'view', title: 'Ver' },
      ];
    case 'lead':
      return [
        { action: 'call', title: 'Llamar' },
        { action: 'view', title: 'Ver' },
      ];
    default:
      return [
        { action: 'view', title: 'Ver' },
        { action: 'dismiss', title: 'Descartar' },
      ];
  }
}

// Handle action clicks
self.addEventListener('notificationclick', (event) => {
  if (event.action === 'dismiss') {
    event.notification.close();
    return;
  }
  
  // Handle other actions...
});

// eslint-disable-next-line no-console
console.log('[SW] Firebase Messaging Service Worker loaded');
