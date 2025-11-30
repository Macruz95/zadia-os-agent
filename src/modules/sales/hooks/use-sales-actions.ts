/**
 * ZADIA OS - Unified Sales Actions with Event Bus
 * 
 * Wrapper que conecta TODAS las acciones de ventas con el Event Bus
 * Cada acción emite eventos que repercuten en todo el sistema
 * 
 * Rule #1: TypeScript strict
 * Rule #3: Real data only
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

// Types
import { Lead, Opportunity, Quote } from '../types/sales.types';
import { LeadFormData, OpportunityFormData, QuoteFormData } from '../validations/sales.schema';

// Services
import { LeadsService } from '../services/leads.service';
import { OpportunitiesService } from '../services/opportunities.service';
import { QuotesService } from '../services/quotes.service';

/**
 * Hook that wraps all sales actions with Event Bus integration
 * Every action emits events that propagate through the entire system
 */
export function useSalesActions() {
  const { user } = useAuth();
  const userId = user?.uid;

  // ============ LEADS ============

  const createLead = useCallback(async (data: LeadFormData): Promise<Lead> => {
    const lead = await LeadsService.createLead(data, userId || '');
    
    // Use fullName for person or entityName for company/institution
    const displayName = lead.fullName || lead.entityName || 'Sin nombre';
    
    await EventBus.emit('lead:created', {
      id: lead.id,
      name: displayName,
      company: lead.company,
      email: lead.email,
      source: lead.source,
      score: lead.score
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'createLead' }
    });

    logger.info('🎯 Lead created + Event emitted', { component: 'SalesActions' });
    return lead;
  }, [userId]);

  const updateLead = useCallback(async (id: string, data: Partial<Lead>): Promise<void> => {
    await LeadsService.updateLead(id, data);
    
    await EventBus.emit('lead:updated', {
      id,
      changes: Object.keys(data),
      ...data
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'updateLead' }
    });

    logger.info('🎯 Lead updated + Event emitted', { component: 'SalesActions' });
  }, [userId]);

  const convertLead = useCallback(async (id: string): Promise<{ clientId: string; opportunityId: string }> => {
    const result = await LeadsService.convertLead(id);
    
    await EventBus.emit('lead:converted', {
      leadId: id,
      clientId: result.clientId,
      opportunityId: result.opportunityId
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'convertLead', cascade: true }
    });

    logger.info('🎯 Lead converted + Event emitted (will cascade)', { component: 'SalesActions' });
    return result;
  }, [userId]);

  // ============ OPPORTUNITIES ============

  const createOpportunity = useCallback(async (data: OpportunityFormData): Promise<Opportunity> => {
    const opportunity = await OpportunitiesService.createOpportunity(data, userId || '');
    
    await EventBus.emit('opportunity:created', {
      id: opportunity.id,
      title: opportunity.name,
      clientId: opportunity.clientId,
      value: opportunity.estimatedValue,
      stage: opportunity.stage,
      probability: opportunity.probability
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'createOpportunity' }
    });

    logger.info('💼 Opportunity created + Event emitted', { component: 'SalesActions' });
    return opportunity;
  }, [userId]);

  const updateOpportunity = useCallback(async (
    id: string,
    data: Partial<OpportunityFormData>
  ): Promise<void> => {
    await OpportunitiesService.updateOpportunity(id, data);
    
    await EventBus.emit('opportunity:updated', {
      id,
      changes: Object.keys(data),
      ...data
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'updateOpportunity' }
    });

    logger.info('💼 Opportunity updated + Event emitted', { component: 'SalesActions' });
  }, [userId]);

  const winOpportunity = useCallback(async (id: string, value: number, clientId: string, title: string): Promise<void> => {
    await OpportunitiesService.updateOpportunity(id, { stage: 'closed-won' });
    
    await EventBus.emit('opportunity:won', {
      id,
      value,
      clientId,
      title
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'winOpportunity', cascade: true }
    });

    logger.info('🏆 Opportunity WON + Event emitted (will create project)', { component: 'SalesActions' });
  }, [userId]);

  const loseOpportunity = useCallback(async (id: string, reason: string): Promise<void> => {
    await OpportunitiesService.updateOpportunity(id, { stage: 'closed-lost' });
    
    await EventBus.emit('opportunity:lost', {
      id,
      reason
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'loseOpportunity' }
    });

    logger.info('❌ Opportunity lost + Event emitted', { component: 'SalesActions' });
  }, [userId]);

  // ============ QUOTES ============

  const createQuote = useCallback(async (data: QuoteFormData): Promise<Quote> => {
    const quote = await QuotesService.createQuote(data, userId || '');
    
    await EventBus.emit('quote:created', {
      id: quote.id,
      clientId: quote.clientId,
      opportunityId: quote.opportunityId,
      total: quote.total,
      itemsCount: quote.items?.length || 0
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'createQuote' }
    });

    logger.info('📄 Quote created + Event emitted', { component: 'SalesActions' });
    return quote;
  }, [userId]);

  const sendQuote = useCallback(async (id: string, clientId: string, total: number): Promise<void> => {
    await QuotesService.updateQuoteStatus(id, 'sent');
    
    await EventBus.emit('quote:sent', {
      id,
      clientId,
      total
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'sendQuote' }
    });

    logger.info('📤 Quote sent + Event emitted', { component: 'SalesActions' });
  }, [userId]);

  const approveQuote = useCallback(async (id: string, clientId: string, total: number): Promise<void> => {
    await QuotesService.updateQuoteStatus(id, 'accepted');
    
    await EventBus.emit('quote:approved', {
      id,
      clientId,
      total
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'approveQuote', cascade: true }
    });

    logger.info('✅ Quote APPROVED + Event emitted (will create invoice)', { component: 'SalesActions' });
  }, [userId]);

  const rejectQuote = useCallback(async (id: string, reason: string): Promise<void> => {
    await QuotesService.updateQuoteStatus(id, 'rejected');
    
    await EventBus.emit('quote:rejected', {
      id,
      reason
    }, {
      source: 'sales-module',
      userId,
      metadata: { action: 'rejectQuote' }
    });

    logger.info('❌ Quote rejected + Event emitted', { component: 'SalesActions' });
  }, [userId]);

  return {
    // Leads
    createLead,
    updateLead,
    convertLead,
    // Opportunities
    createOpportunity,
    updateOpportunity,
    winOpportunity,
    loseOpportunity,
    // Quotes
    createQuote,
    sendQuote,
    approveQuote,
    rejectQuote
  };
}
