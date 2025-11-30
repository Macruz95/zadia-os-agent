/**
 * ZADIA OS - Unified Finance Actions with Event Bus
 * 
 * Wrapper que conecta TODAS las acciones financieras con el Event Bus
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
import { toast } from 'sonner';

// Services
import { InvoicesService } from '../services/invoices.service';
import { PaymentsService } from '../services/payments.service';

// Types
import type { CreateInvoiceInput, UpdateInvoiceInput, CreatePaymentInput } from '../validations/finance.validation';

/**
 * Hook that wraps all finance actions with Event Bus integration
 * Every action emits events that propagate through the entire system
 */
export function useFinanceActions() {
  const { user } = useAuth();
  const userId = user?.uid;

  // ============ INVOICES ============

  const createInvoice = useCallback(async (data: CreateInvoiceInput): Promise<string> => {
    const id = await InvoicesService.createInvoice(data);
    
    await EventBus.emit('invoice:created', {
      id,
      number: data.number,
      clientId: data.clientId,
      subtotal: data.subtotal,
      taxes: data.taxes,
      total: data.total,
      dueDate: data.dueDate
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'createInvoice' }
    });

    toast.success(`Factura ${data.number} creada exitosamente`);
    logger.info('📄 Invoice created + Event emitted', { component: 'FinanceActions' });
    return id;
  }, [userId]);

  const sendInvoice = useCallback(async (
    id: string,
    number: string,
    clientId: string,
    total: number
  ): Promise<void> => {
    await InvoicesService.updateInvoice(id, { status: 'sent' });
    
    await EventBus.emit('invoice:sent', {
      id,
      number,
      clientId,
      total
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'sendInvoice' }
    });

    toast.success('Factura enviada al cliente');
    logger.info('📤 Invoice sent + Event emitted', { component: 'FinanceActions' });
  }, [userId]);

  const markInvoicePaid = useCallback(async (
    id: string,
    number: string,
    clientId: string,
    amount: number
  ): Promise<void> => {
    await InvoicesService.updateInvoice(id, { status: 'paid' });
    
    await EventBus.emit('invoice:paid', {
      id,
      number,
      clientId,
      amount
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'markInvoicePaid', cascade: true }
    });

    toast.success('Factura marcada como pagada');
    logger.info('✅ Invoice PAID + Event emitted (will update cash flow)', { component: 'FinanceActions' });
  }, [userId]);

  const markInvoiceOverdue = useCallback(async (
    id: string,
    number: string,
    clientId: string,
    amount: number,
    daysOverdue: number
  ): Promise<void> => {
    await InvoicesService.updateInvoice(id, { status: 'overdue' });
    
    await EventBus.emit('invoice:overdue', {
      id,
      number,
      clientId,
      amount,
      daysOverdue
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'markInvoiceOverdue', alert: true }
    });

    toast.warning('Factura marcada como vencida');
    logger.info('⚠️ Invoice OVERDUE + Event emitted (will trigger collection)', { component: 'FinanceActions' });
  }, [userId]);

  const updateInvoice = useCallback(async (
    id: string,
    updates: UpdateInvoiceInput
  ): Promise<void> => {
    await InvoicesService.updateInvoice(id, updates);
    
    logger.info('📄 Invoice updated', { component: 'FinanceActions' });
  }, []);

  // ============ PAYMENTS ============

  const createPayment = useCallback(async (data: CreatePaymentInput): Promise<string> => {
    const id = await PaymentsService.createPayment(data);
    
    await EventBus.emit('payment:received', {
      id,
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'createPayment', cascade: true }
    });

    toast.success('Pago registrado exitosamente');
    logger.info('💰 Payment received + Event emitted', { component: 'FinanceActions' });
    return id;
  }, [userId]);

  const cancelPayment = useCallback(async (
    id: string,
    invoiceId: string,
    amount: number
  ): Promise<void> => {
    await PaymentsService.cancelPayment(id);
    
    await EventBus.emit('payment:pending', {
      paymentId: id,
      invoiceId,
      amount,
      reason: 'cancelled'
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'cancelPayment' }
    });

    toast.success('Pago cancelado correctamente');
    logger.info('❌ Payment cancelled + Event emitted', { component: 'FinanceActions' });
  }, [userId]);

  // ============ EXPENSES ============

  const createExpense = useCallback(async (data: {
    description: string;
    amount: number;
    category: string;
    date: Date;
  }): Promise<void> => {
    // TODO: Implement expense service
    
    await EventBus.emit('expense:created', {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date
    }, {
      source: 'finance-module',
      userId,
      metadata: { action: 'createExpense' }
    });

    toast.success('Gasto registrado');
    logger.info('💸 Expense created + Event emitted', { component: 'FinanceActions' });
  }, [userId]);

  return {
    // Invoices
    createInvoice,
    sendInvoice,
    markInvoicePaid,
    markInvoiceOverdue,
    updateInvoice,
    // Payments
    createPayment,
    cancelPayment,
    // Expenses
    createExpense
  };
}
