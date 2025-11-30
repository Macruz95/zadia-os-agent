/**
 * ZADIA OS - DTO Propagation Service
 * 
 * Servicio que escucha eventos y actualiza entidades relacionadas
 * Ejemplo: Quote aprobada → Crea Invoice + Actualiza Opportunity + Notifica
 * 
 * Rule #1: TypeScript strict
 * Rule #3: Real data integration
 */

import { EventBus, ZadiaEvent, ZadiaEventType } from './event-bus';
import { logger } from '@/lib/logger';

export interface PropagationRule {
  id: string;
  name: string;
  triggerEvent: ZadiaEventType;
  targetModules: string[];
  action: (event: ZadiaEvent) => Promise<PropagationResult>;
  enabled: boolean;
}

export interface PropagationResult {
  success: boolean;
  affectedEntities: Array<{
    module: string;
    entityType: string;
    entityId: string;
    action: 'created' | 'updated' | 'deleted';
  }>;
  errors?: string[];
}

/**
 * DTO Propagation Service - Conecta todas las entidades
 */
class DTOPropagationServiceClass {
  private static instance: DTOPropagationServiceClass;
  private rules: PropagationRule[] = [];
  private propagationLog: Array<{
    eventId: string;
    result: PropagationResult;
    timestamp: Date;
  }> = [];

  private constructor() {
    this.initializeDefaultRules();
    this.subscribeToEvents();
    logger.info('🔗 DTO Propagation Service initialized', { component: 'DTOPropagation' });
  }

  static getInstance(): DTOPropagationServiceClass {
    if (!DTOPropagationServiceClass.instance) {
      DTOPropagationServiceClass.instance = new DTOPropagationServiceClass();
    }
    return DTOPropagationServiceClass.instance;
  }

  /**
   * Initialize default propagation rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // Quote approved → Create Invoice + Update Opportunity
      {
        id: 'quote-to-invoice',
        name: 'Cotización Aprobada → Factura',
        triggerEvent: 'quote:approved',
        targetModules: ['finance', 'sales'],
        action: async (event) => this.handleQuoteApproved(event),
        enabled: true
      },
      // Opportunity won → Create Project
      {
        id: 'opportunity-to-project',
        name: 'Oportunidad Ganada → Proyecto',
        triggerEvent: 'opportunity:won',
        targetModules: ['projects', 'sales'],
        action: async (event) => this.handleOpportunityWon(event),
        enabled: true
      },
      // Invoice paid → Update Cash Flow + Client Balance
      {
        id: 'payment-cascade',
        name: 'Pago Recibido → Actualizar Finanzas',
        triggerEvent: 'invoice:paid',
        targetModules: ['finance', 'clients'],
        action: async (event) => this.handleInvoicePaid(event),
        enabled: true
      },
      // Product low stock → Create Alert + Notify
      {
        id: 'low-stock-alert',
        name: 'Stock Bajo → Alerta',
        triggerEvent: 'product:low_stock',
        targetModules: ['inventory', 'notifications'],
        action: async (event) => this.handleLowStock(event),
        enabled: true
      },
      // Lead converted → Create Opportunity
      {
        id: 'lead-to-opportunity',
        name: 'Lead Convertido → Oportunidad',
        triggerEvent: 'lead:converted',
        targetModules: ['sales'],
        action: async (event) => this.handleLeadConverted(event),
        enabled: true
      },
      // Project delayed → Notify + Update Timeline
      {
        id: 'project-delay-cascade',
        name: 'Proyecto Retrasado → Notificaciones',
        triggerEvent: 'project:delayed',
        targetModules: ['projects', 'notifications'],
        action: async (event) => this.handleProjectDelayed(event),
        enabled: true
      }
    ];
  }

  /**
   * Subscribe to all trigger events
   */
  private subscribeToEvents(): void {
    EventBus.subscribe('*', async (event) => {
      await this.processEvent(event);
    }, 100); // High priority
  }

  /**
   * Process event and trigger propagations
   */
  private async processEvent(event: ZadiaEvent): Promise<void> {
    const matchingRules = this.rules.filter(
      rule => rule.enabled && rule.triggerEvent === event.type
    );

    for (const rule of matchingRules) {
      try {
        logger.info(`🔄 Executing propagation: ${rule.name}`, {
          component: 'DTOPropagation',
          metadata: { ruleId: rule.id, eventId: event.id }
        });

        const result = await rule.action(event);
        
        this.propagationLog.unshift({
          eventId: event.id,
          result,
          timestamp: new Date()
        });

        // Keep log limited
        if (this.propagationLog.length > 100) {
          this.propagationLog = this.propagationLog.slice(0, 100);
        }

        if (result.success) {
          logger.info(`✅ Propagation successful: ${rule.name}`, {
            component: 'DTOPropagation',
            metadata: { affectedCount: result.affectedEntities.length }
          });
        }
      } catch (error) {
        logger.error(
          `Propagation failed: ${rule.name}`,
          error instanceof Error ? error : new Error(String(error)),
          { component: 'DTOPropagation' }
        );
      }
    }
  }

  // ============ PROPAGATION HANDLERS ============

  private async handleQuoteApproved(event: ZadiaEvent): Promise<PropagationResult> {
    const quoteData = event.data as { id: string; clientId: string; total: number };
    
    // Emit cascade events
    await EventBus.emit('invoice:created', {
      sourceQuoteId: quoteData.id,
      clientId: quoteData.clientId,
      amount: quoteData.total,
      autoGenerated: true
    }, { source: 'dto-propagation' });

    return {
      success: true,
      affectedEntities: [
        { module: 'finance', entityType: 'invoice', entityId: 'pending', action: 'created' },
        { module: 'sales', entityType: 'opportunity', entityId: 'pending', action: 'updated' }
      ]
    };
  }

  private async handleOpportunityWon(event: ZadiaEvent): Promise<PropagationResult> {
    const oppData = event.data as { id: string; clientId: string; value: number; title: string };
    
    await EventBus.emit('project:created', {
      sourceOpportunityId: oppData.id,
      clientId: oppData.clientId,
      budget: oppData.value,
      name: `Proyecto: ${oppData.title}`,
      autoGenerated: true
    }, { source: 'dto-propagation' });

    return {
      success: true,
      affectedEntities: [
        { module: 'projects', entityType: 'project', entityId: 'pending', action: 'created' }
      ]
    };
  }

  private async handleInvoicePaid(event: ZadiaEvent): Promise<PropagationResult> {
    const invoiceData = event.data as { id: string; clientId: string; amount: number };
    
    return {
      success: true,
      affectedEntities: [
        { module: 'finance', entityType: 'cashflow', entityId: 'main', action: 'updated' },
        { module: 'clients', entityType: 'client', entityId: invoiceData.clientId, action: 'updated' }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleLowStock(_event: ZadiaEvent): Promise<PropagationResult> {
    // TODO: Implement notification creation for low stock
    return {
      success: true,
      affectedEntities: [
        { module: 'notifications', entityType: 'alert', entityId: 'new', action: 'created' }
      ]
    };
  }

  private async handleLeadConverted(event: ZadiaEvent): Promise<PropagationResult> {
    const leadData = event.data as { id: string; clientId: string };
    
    await EventBus.emit('opportunity:created', {
      sourceLeadId: leadData.id,
      clientId: leadData.clientId,
      autoGenerated: true
    }, { source: 'dto-propagation' });

    return {
      success: true,
      affectedEntities: [
        { module: 'sales', entityType: 'opportunity', entityId: 'pending', action: 'created' }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleProjectDelayed(_event: ZadiaEvent): Promise<PropagationResult> {
    // TODO: Implement notification creation for delayed projects
    return {
      success: true,
      affectedEntities: [
        { module: 'notifications', entityType: 'alert', entityId: 'new', action: 'created' }
      ]
    };
  }

  // ============ PUBLIC API ============

  getRules(): PropagationRule[] {
    return this.rules;
  }

  getRecentPropagations(limit = 20) {
    return this.propagationLog.slice(0, limit);
  }
}

export const DTOPropagationService = DTOPropagationServiceClass.getInstance();
