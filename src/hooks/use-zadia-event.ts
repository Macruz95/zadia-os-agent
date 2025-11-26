/**
 * ZADIA OS - useZadiaEvent Hook
 * 
 * Hook para emitir y suscribirse a eventos del sistema
 * Conecta componentes React con el Event Bus central
 * 
 * Rule #1: TypeScript strict
 * Rule #2: React hooks pattern
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { EventBus, ZadiaEvent, ZadiaEventType } from '@/lib/events';

interface UseZadiaEventOptions {
  userId?: string;
  organizationId?: string;
  source?: string;
}

/**
 * Hook to emit events to the ZADIA Event Bus
 */
export function useZadiaEmit(options?: UseZadiaEventOptions) {
  const emit = useCallback(async <T = unknown>(
    type: ZadiaEventType,
    data: T,
    metadata?: Record<string, unknown>
  ) => {
    await EventBus.emit(type, data, {
      source: options?.source || 'ui',
      userId: options?.userId,
      organizationId: options?.organizationId,
      metadata
    });
  }, [options?.source, options?.userId, options?.organizationId]);

  return { emit };
}

/**
 * Hook to subscribe to events from the ZADIA Event Bus
 */
export function useZadiaSubscribe(
  eventType: ZadiaEventType | '*',
  callback: (event: ZadiaEvent) => void
) {
  useEffect(() => {
    const unsubscribe = EventBus.subscribe(eventType, callback);
    return () => unsubscribe();
  }, [eventType, callback]);
}

/**
 * Hook to get recent events
 */
export function useZadiaEvents(limit = 20) {
  const [events, setEvents] = useState<ZadiaEvent[]>([]);

  useEffect(() => {
    // Initial load
    setEvents(EventBus.getRecentEvents(limit));

    // Subscribe to all events to update list
    const unsubscribe = EventBus.subscribe('*', () => {
      setEvents(EventBus.getRecentEvents(limit));
    });

    return () => unsubscribe();
  }, [limit]);

  return events;
}

/**
 * Combined hook for full event system access
 */
export function useZadiaEventSystem(options?: UseZadiaEventOptions) {
  const { emit } = useZadiaEmit(options);
  const events = useZadiaEvents();

  const subscribe = useCallback((
    eventType: ZadiaEventType | '*',
    callback: (event: ZadiaEvent) => void
  ) => {
    return EventBus.subscribe(eventType, callback);
  }, []);

  return {
    emit,
    events,
    subscribe,
    subscriptionCount: EventBus.getSubscriptionCount()
  };
}
