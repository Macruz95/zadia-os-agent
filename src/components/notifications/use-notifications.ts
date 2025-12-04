/**
 * ZADIA OS - Notifications Hook
 * 
 * Hook para gestionar notificaciones en tiempo real
 * REGLA 1: DATOS REALES de Firebase
 * REGLA 5: < 150 líneas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'action';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface NotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(maxNotifications: number = 20): NotificationsResult {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to notifications in real-time
  useEffect(() => {
    if (!user?.uid || !tenantId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notificationsRef = collection(db, 'notifications');
      // Filter by tenantId for data isolation and userId for user-specific notifications
      const notificationsQuery = query(
        notificationsRef,
        where('tenantId', '==', tenantId),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(maxNotifications)
      );

      const unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const newNotifications: Notification[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              type: data.type || 'info',
              priority: data.priority || 'medium',
              title: data.title || '',
              message: data.message || '',
              read: data.read || false,
              actionUrl: data.actionUrl,
              actionLabel: data.actionLabel,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              metadata: data.metadata,
            };
          });
          setNotifications(newNotifications);
          setLoading(false);
        },
        () => {
          // Collection might not exist yet
          setNotifications([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch {
      setError('Error cargando notificaciones');
      setLoading(false);
    }
  }, [user?.uid, tenantId, maxNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.uid) return;
    
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { read: true });
    } catch {
      // Handle silently
    }
  }, [user?.uid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => {
          const notificationRef = doc(db, 'notifications', n.id);
          return updateDoc(notificationRef, { read: true });
        })
      );
    } catch {
      // Handle silently
    }
  }, [user?.uid, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

// Helper to create notification (for use in services)
export async function createNotification(
  tenantId: string,
  userId: string,
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<void> {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase');

  await addDoc(collection(db, 'notifications'), {
    tenantId,
    userId,
    ...notification,
    read: false,
    createdAt: serverTimestamp(),
  });
}

