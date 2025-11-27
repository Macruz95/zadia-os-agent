/**
 * ZADIA OS - Client Actions Hook
 * 
 * Integra acciones de clientes con el Event Bus central
 * Cada acción emite eventos que los agentes procesan automáticamente
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: 'individual' | 'company';
  status?: string;
  [key: string]: unknown;
}

interface InteractionData {
  id?: string;
  clientId: string;
  clientName: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp';
  subject?: string;
  notes?: string;
  outcome?: string;
  [key: string]: unknown;
}

export function useClientActions() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREAR CLIENTE
  // ═══════════════════════════════════════════════════════════════════════
  const createClient = useCallback(async (data: Omit<ClientData, 'id'> & { id?: string }) => {
    const clientId = data.id || `client-${Date.now()}`;
    
    await EventBus.emit('client:created', {
      clientId,
      clientName: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      type: data.type || 'individual',
      ...data
    }, { source: 'clients-module' });

    logger.info('✅ Client created', { clientId, name: data.name });
    return clientId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR CLIENTE
  // ═══════════════════════════════════════════════════════════════════════
  const updateClient = useCallback(async (clientId: string, data: Partial<ClientData>) => {
    await EventBus.emit('client:updated', {
      clientId,
      changes: data,
      clientName: data.name
    }, { source: 'clients-module' });

    logger.info('✅ Client updated', { clientId });
    return clientId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CLIENTE ACTIVO / INACTIVO
  // ═══════════════════════════════════════════════════════════════════════
  const activateClient = useCallback(async (clientId: string, clientName: string) => {
    await EventBus.emit('client:activated', {
      clientId,
      clientName,
      status: 'active'
    }, { source: 'clients-module' });

    logger.info('✅ Client activated', { clientId });
  }, []);

  const deactivateClient = useCallback(async (clientId: string, clientName: string, reason?: string) => {
    await EventBus.emit('client:deactivated', {
      clientId,
      clientName,
      status: 'inactive',
      reason
    }, { source: 'clients-module' });

    logger.info('✅ Client deactivated', { clientId, reason });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // REGISTRAR INTERACCIÓN
  // ═══════════════════════════════════════════════════════════════════════
  const logInteraction = useCallback(async (data: InteractionData) => {
    const interactionId = data.id || `interaction-${Date.now()}`;
    
    await EventBus.emit('client:interaction', {
      interactionId,
      clientId: data.clientId,
      clientName: data.clientName,
      interactionType: data.type,
      subject: data.subject,
      notes: data.notes,
      outcome: data.outcome,
      timestamp: new Date().toISOString()
    }, { source: 'clients-module' });

    logger.info('✅ Interaction logged', { 
      interactionId, 
      clientId: data.clientId, 
      type: data.type 
    });
    return interactionId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CLIENTE VIP / SEGMENTACIÓN
  // ═══════════════════════════════════════════════════════════════════════
  const markAsVIP = useCallback(async (clientId: string, clientName: string) => {
    await EventBus.emit('client:vip_marked', {
      clientId,
      clientName,
      segment: 'VIP',
      markedAt: new Date().toISOString()
    }, { source: 'clients-module' });

    logger.info('✅ Client marked as VIP', { clientId });
  }, []);

  const updateSegment = useCallback(async (
    clientId: string, 
    clientName: string, 
    segment: string
  ) => {
    await EventBus.emit('client:segment_changed', {
      clientId,
      clientName,
      segment,
      changedAt: new Date().toISOString()
    }, { source: 'clients-module' });

    logger.info('✅ Client segment updated', { clientId, segment });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ALERTAS DE CLIENTE
  // ═══════════════════════════════════════════════════════════════════════
  const flagClient = useCallback(async (
    clientId: string, 
    clientName: string, 
    flag: string,
    reason: string
  ) => {
    await EventBus.emit('client:flagged', {
      clientId,
      clientName,
      flag,
      reason,
      flaggedAt: new Date().toISOString()
    }, { source: 'clients-module' });

    logger.info('⚠️ Client flagged', { clientId, flag, reason });
  }, []);

  return {
    // CRUD
    createClient,
    updateClient,
    
    // Estado
    activateClient,
    deactivateClient,
    
    // Interacciones
    logInteraction,
    
    // Segmentación
    markAsVIP,
    updateSegment,
    
    // Alertas
    flagClient
  };
}
