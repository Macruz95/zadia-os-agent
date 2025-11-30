/**
 * ZADIA OS - Use Push Notifications Hook
 * 
 * React hook for managing push notifications
 * REGLA 2: ShadCN components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  requestNotificationPermission,
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission,
  NotificationPayload,
} from '@/services/push-notification.service';
import { toast } from 'sonner';

interface UsePushNotifications {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isEnabled: boolean;
  token: string | null;
  enableNotifications: () => Promise<boolean>;
  showNotification: (payload: NotificationPayload) => void;
}

export function usePushNotifications(): UsePushNotifications {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check support on mount
  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    const unsubscribe = onForegroundMessage((payload) => {
      // Show toast for foreground notifications
      toast(payload.title, {
        description: payload.body,
        action: payload.data?.url ? {
          label: 'Ver',
          onClick: () => {
            window.location.href = payload.data!.url;
          },
        } : undefined,
      });
    });

    return unsubscribe;
  }, [isSupported, permission]);

  // Enable notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) {
      toast.error('Debes iniciar sesión para activar notificaciones');
      return false;
    }

    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return false;
    }

    const fcmToken = await requestNotificationPermission(user.uid);
    
    if (fcmToken) {
      setToken(fcmToken);
      setPermission('granted');
      toast.success('Notificaciones activadas');
      return true;
    } else {
      setPermission(getNotificationPermission());
      if (getNotificationPermission() === 'denied') {
        toast.error('Permiso de notificaciones denegado. Actívalas en la configuración del navegador.');
      }
      return false;
    }
  }, [user?.uid, isSupported]);

  // Show a local notification (for testing)
  const showNotification = useCallback((payload: NotificationPayload) => {
    if (permission !== 'granted') return;

    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
    });
  }, [permission]);

  return {
    isSupported,
    permission,
    isEnabled: permission === 'granted' && !!token,
    token,
    enableNotifications,
    showNotification,
  };
}
