/**
 * ZADIA OS - Event Bus Central
 * 
 * Sistema de eventos que conecta TODOS los módulos
 * Una sola entrada repercute en todo el sistema
 * 
 * Rule #1: TypeScript strict
 * Rule #5: Single responsibility
 */

import { logger } from '@/lib/logger';

// Tipos de eventos del sistema
export type ZadiaEventType =
  // Sales Events
  | 'lead:created' | 'lead:updated' | 'lead:converted'
  | 'opportunity:created' | 'opportunity:updated' | 'opportunity:won' | 'opportunity:lost'
  | 'quote:created' | 'quote:sent' | 'quote:approved' | 'quote:rejected'
  // Finance Events
  | 'invoice:created' | 'invoice:sent' | 'invoice:paid' | 'invoice:overdue'
  | 'expense:created' | 'expense:approved' | 'expense:rejected'
  | 'payment:received' | 'payment:pending'
  // Inventory Events
  | 'product:created' | 'product:updated' | 'product:low_stock'
  | 'movement:in' | 'movement:out' | 'movement:transfer'
  // Project Events
  | 'project:created' | 'project:started' | 'project:completed' | 'project:delayed'
  | 'task:created' | 'task:completed' | 'task:overdue'
  // HR Events
  | 'employee:created' | 'employee:updated'
  // Client Events
  | 'client:created' | 'client:updated'
  // System Events
  | 'system:startup' | 'system:error';

export interface ZadiaEvent<T = unknown> {
  id: string;
  type: ZadiaEventType;
  timestamp: Date;
  source: string;
  userId?: string;
  organizationId?: string;
  data: T;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (event: ZadiaEvent<T>) => Promise<void> | void;

interface EventSubscription {
  id: string;
  eventType: ZadiaEventType | '*';
  handler: EventHandler;
  priority: number;
}

/**
 * Event Bus Singleton - Corazón del sistema A-OS
 */
class EventBusClass {
  private static instance: EventBusClass;
  private subscriptions: EventSubscription[] = [];
  private eventHistory: ZadiaEvent[] = [];
  private maxHistorySize = 100;

  private constructor() {
    logger.info('🚀 ZADIA Event Bus initialized', { component: 'EventBus' });
  }

  static getInstance(): EventBusClass {
    if (!EventBusClass.instance) {
      EventBusClass.instance = new EventBusClass();
    }
    return EventBusClass.instance;
  }

  /**
   * Subscribe to events
   */
  subscribe(
    eventType: ZadiaEventType | '*',
    handler: EventHandler,
    priority = 0
  ): () => void {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler,
      priority
    };

    this.subscriptions.push(subscription);
    this.subscriptions.sort((a, b) => b.priority - a.priority);

    logger.info(`📝 Subscribed to ${eventType}`, {
      component: 'EventBus',
      metadata: { subscriptionId: subscription.id }
    });

    // Return unsubscribe function
    return () => {
      this.subscriptions = this.subscriptions.filter(s => s.id !== subscription.id);
    };
  }

  /**
   * Emit event to all subscribers
   */
  async emit<T = unknown>(
    type: ZadiaEventType,
    data: T,
    options?: {
      source?: string;
      userId?: string;
      organizationId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const event: ZadiaEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      source: options?.source || 'system',
      userId: options?.userId,
      organizationId: options?.organizationId,
      data,
      metadata: options?.metadata
    };

    // Add to history
    this.eventHistory.unshift(event as ZadiaEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }

    logger.info(`📢 Event emitted: ${type}`, {
      component: 'EventBus',
      metadata: { eventId: event.id, source: event.source }
    });

    // Find matching subscribers
    const matchingSubscriptions = this.subscriptions.filter(
      sub => sub.eventType === '*' || sub.eventType === type
    );

    // Execute handlers in order of priority
    for (const subscription of matchingSubscriptions) {
      try {
        await subscription.handler(event as ZadiaEvent);
      } catch (error) {
        logger.error(`Handler error for ${type}`, {
          component: 'EventBus',
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { subscriptionId: subscription.id }
        });
      }
    }
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit = 20): ZadiaEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: ZadiaEventType, limit = 20): ZadiaEvent[] {
    return this.eventHistory.filter(e => e.type === type).slice(0, limit);
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.length;
  }
}

// Export singleton
export const EventBus = EventBusClass.getInstance();
