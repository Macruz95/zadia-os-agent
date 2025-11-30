/**
 * ZADIA OS - Zapier Integration Service
 * Connect ZADIA OS with 5000+ apps via Zapier
 * 
 * API KEY REQUIRED: ZAPIER_WEBHOOK_SECRET (optional, for verification)
 * Setup: Create Zaps at https://zapier.com/
 */

import { logger } from '@/lib/logger';
import crypto from 'crypto';

// ============================================
// Types
// ============================================

export type ZapierEventType = 
  | 'client.created'
  | 'client.updated'
  | 'client.deleted'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'sale.completed'
  | 'inventory.low_stock'
  | 'project.created'
  | 'project.completed'
  | 'lead.converted'
  | 'opportunity.won'
  | 'opportunity.lost'
  | 'task.completed'
  | 'workflow.completed';

interface ZapierWebhook {
  id: string;
  tenantId: string;
  url: string;
  events: ZapierEventType[];
  name: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
}

interface ZapierPayload {
  event: ZapierEventType;
  timestamp: string;
  tenantId: string;
  data: Record<string, unknown>;
}

// ============================================
// Service
// ============================================

export class ZapierService {
  private static webhooks = new Map<string, ZapierWebhook[]>();
  private static readonly WEBHOOK_SECRET = process.env.ZAPIER_WEBHOOK_SECRET || '';

  /**
   * Register a Zapier webhook URL for specific events
   */
  static async registerWebhook(
    tenantId: string,
    url: string,
    events: ZapierEventType[],
    name: string
  ): Promise<ZapierWebhook> {
    const webhook: ZapierWebhook = {
      id: `zap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      url,
      events,
      name,
      isActive: true,
      createdAt: new Date(),
      triggerCount: 0
    };

    const existing = this.webhooks.get(tenantId) || [];
    existing.push(webhook);
    this.webhooks.set(tenantId, existing);

    logger.info('Zapier webhook registered', {
      component: 'ZapierService',
      metadata: { webhookId: webhook.id, events }
    });

    return webhook;
  }

  /**
   * Unregister a webhook
   */
  static async unregisterWebhook(tenantId: string, webhookId: string): Promise<void> {
    const existing = this.webhooks.get(tenantId) || [];
    const filtered = existing.filter(w => w.id !== webhookId);
    this.webhooks.set(tenantId, filtered);

    logger.info('Zapier webhook unregistered', {
      component: 'ZapierService',
      metadata: { webhookId }
    });
  }

  /**
   * Get all webhooks for a tenant
   */
  static async getWebhooks(tenantId: string): Promise<ZapierWebhook[]> {
    return this.webhooks.get(tenantId) || [];
  }

  /**
   * Trigger webhooks for an event
   */
  static async triggerEvent(
    tenantId: string,
    event: ZapierEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    const webhooks = this.webhooks.get(tenantId) || [];
    const relevantWebhooks = webhooks.filter(
      w => w.isActive && w.events.includes(event)
    );

    if (relevantWebhooks.length === 0) {
      return;
    }

    const payload: ZapierPayload = {
      event,
      timestamp: new Date().toISOString(),
      tenantId,
      data
    };

    const signature = this.generateSignature(payload);

    for (const webhook of relevantWebhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Zadia-Signature': signature,
            'X-Zadia-Event': event
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          webhook.lastTriggeredAt = new Date();
          webhook.triggerCount++;
          
          logger.info('Zapier webhook triggered', {
            component: 'ZapierService',
            metadata: { webhookId: webhook.id, event }
          });
        } else {
          logger.error('Zapier webhook failed', new Error(`Status: ${response.status}`), {
            component: 'ZapierService',
            metadata: { webhookId: webhook.id, event }
          });
        }
      } catch (error) {
        logger.error('Zapier webhook error', error as Error, {
          component: 'ZapierService',
          metadata: { webhookId: webhook.id, event }
        });
      }
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private static generateSignature(payload: ZapierPayload): string {
    if (!this.WEBHOOK_SECRET) {
      return '';
    }

    const hmac = crypto.createHmac('sha256', this.WEBHOOK_SECRET);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify incoming webhook signature
   */
  static verifySignature(payload: string, signature: string): boolean {
    if (!this.WEBHOOK_SECRET) {
      return true; // Skip verification if no secret
    }

    const hmac = crypto.createHmac('sha256', this.WEBHOOK_SECRET);
    hmac.update(payload);
    const expected = `sha256=${hmac.digest('hex')}`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  // ============================================
  // Helper methods to trigger common events
  // ============================================

  static async onClientCreated(tenantId: string, client: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'client.created', client);
  }

  static async onClientUpdated(tenantId: string, client: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'client.updated', client);
  }

  static async onInvoiceCreated(tenantId: string, invoice: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'invoice.created', invoice);
  }

  static async onInvoicePaid(tenantId: string, invoice: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'invoice.paid', invoice);
  }

  static async onSaleCompleted(tenantId: string, sale: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'sale.completed', sale);
  }

  static async onLowStock(tenantId: string, product: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'inventory.low_stock', product);
  }

  static async onProjectCompleted(tenantId: string, project: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'project.completed', project);
  }

  static async onLeadConverted(tenantId: string, lead: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'lead.converted', lead);
  }

  static async onOpportunityWon(tenantId: string, opportunity: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'opportunity.won', opportunity);
  }

  static async onWorkflowCompleted(tenantId: string, workflow: Record<string, unknown>): Promise<void> {
    await this.triggerEvent(tenantId, 'workflow.completed', workflow);
  }
}

export default ZapierService;
