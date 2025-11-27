/**
 * ZADIA OS - Order Actions Hook
 * 
 * Integra acciones de pedidos con el Event Bus central
 * Cada acción emite eventos que los agentes procesan automáticamente
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

interface OrderData {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status?: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  priority?: 'normal' | 'high' | 'urgent';
  deliveryDate?: string;
  notes?: string;
  [key: string]: unknown;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DeliveryData {
  orderId: string;
  orderNumber: string;
  clientName: string;
  deliveredBy?: string;
  signature?: string;
  notes?: string;
}

export function useOrderActions() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREAR PEDIDO
  // ═══════════════════════════════════════════════════════════════════════
  const createOrder = useCallback(async (data: Omit<OrderData, 'id'> & { id?: string }) => {
    const orderId = data.id || `order-${Date.now()}`;
    
    await EventBus.emit('order:created', {
      orderId,
      orderNumber: data.orderNumber,
      clientId: data.clientId,
      clientName: data.clientName,
      items: data.items,
      itemCount: data.items.length,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: 'pending',
      priority: data.priority || 'normal',
      deliveryDate: data.deliveryDate
    }, { source: 'orders-module' });

    logger.info('✅ Order created', { orderId, orderNumber: data.orderNumber });
    return orderId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIRMAR PEDIDO
  // ═══════════════════════════════════════════════════════════════════════
  const confirmOrder = useCallback(async (
    orderId: string, 
    orderNumber: string,
    clientName: string
  ) => {
    await EventBus.emit('order:confirmed', {
      orderId,
      orderNumber,
      clientName,
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('✅ Order confirmed', { orderId, orderNumber });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // INICIAR PRODUCCIÓN
  // ═══════════════════════════════════════════════════════════════════════
  const startProduction = useCallback(async (
    orderId: string,
    orderNumber: string,
    clientName: string
  ) => {
    await EventBus.emit('order:production_started', {
      orderId,
      orderNumber,
      clientName,
      status: 'in_production',
      productionStartedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('🏭 Order production started', { orderId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // MARCAR COMO LISTO
  // ═══════════════════════════════════════════════════════════════════════
  const markAsReady = useCallback(async (
    orderId: string,
    orderNumber: string,
    clientId: string,
    clientName: string
  ) => {
    await EventBus.emit('order:ready', {
      orderId,
      orderNumber,
      clientId,
      clientName,
      status: 'ready',
      readyAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('✅ Order ready for delivery', { orderId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ENTREGAR PEDIDO
  // ═══════════════════════════════════════════════════════════════════════
  const deliverOrder = useCallback(async (data: DeliveryData) => {
    await EventBus.emit('order:delivered', {
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      clientName: data.clientName,
      deliveredBy: data.deliveredBy,
      signature: data.signature,
      notes: data.notes,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('📦 Order delivered', { orderId: data.orderId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CANCELAR PEDIDO
  // ═══════════════════════════════════════════════════════════════════════
  const cancelOrder = useCallback(async (
    orderId: string,
    orderNumber: string,
    clientName: string,
    reason: string
  ) => {
    await EventBus.emit('order:cancelled', {
      orderId,
      orderNumber,
      clientName,
      reason,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('❌ Order cancelled', { orderId, reason });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR PRIORIDAD
  // ═══════════════════════════════════════════════════════════════════════
  const updatePriority = useCallback(async (
    orderId: string,
    orderNumber: string,
    priority: 'normal' | 'high' | 'urgent'
  ) => {
    await EventBus.emit('order:priority_changed', {
      orderId,
      orderNumber,
      priority,
      changedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('📌 Order priority updated', { orderId, priority });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR FECHA DE ENTREGA
  // ═══════════════════════════════════════════════════════════════════════
  const updateDeliveryDate = useCallback(async (
    orderId: string,
    orderNumber: string,
    newDate: string,
    reason?: string
  ) => {
    await EventBus.emit('order:delivery_date_changed', {
      orderId,
      orderNumber,
      newDeliveryDate: newDate,
      reason,
      changedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('📅 Order delivery date updated', { orderId, newDate });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // AGREGAR NOTA
  // ═══════════════════════════════════════════════════════════════════════
  const addNote = useCallback(async (
    orderId: string,
    orderNumber: string,
    note: string,
    type: 'internal' | 'customer' = 'internal'
  ) => {
    await EventBus.emit('order:note_added', {
      orderId,
      orderNumber,
      note,
      noteType: type,
      addedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.info('📝 Note added to order', { orderId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // PROBLEMA / INCIDENCIA
  // ═══════════════════════════════════════════════════════════════════════
  const reportIssue = useCallback(async (
    orderId: string,
    orderNumber: string,
    issue: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    await EventBus.emit('order:issue_reported', {
      orderId,
      orderNumber,
      issue,
      severity,
      reportedAt: new Date().toISOString()
    }, { source: 'orders-module' });

    logger.warn('⚠️ Order issue reported', { orderId, severity });
  }, []);

  return {
    // CRUD
    createOrder,
    
    // Flujo de estado
    confirmOrder,
    startProduction,
    markAsReady,
    deliverOrder,
    cancelOrder,
    
    // Actualizaciones
    updatePriority,
    updateDeliveryDate,
    addNote,
    
    // Alertas
    reportIssue
  };
}
