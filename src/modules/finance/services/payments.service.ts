// src/modules/finance/services/payments.service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Payment } from '../types/finance.types';
import type {
  CreatePaymentInput,
  UpdatePaymentInput,
} from '../validations/finance.validation';
import { InvoicesService } from './invoices.service';

/**
 * Servicio de Pagos
 * Maneja pagos y actualiza facturas automáticamente
 */
export const PaymentsService = {
  /**
   * Registrar un nuevo pago
   * @param paymentData - Datos del pago validados
   * @returns ID del pago creado
   */
  async createPayment(paymentData: CreatePaymentInput): Promise<string> {
    try {
      const paymentsRef = collection(db, 'payments');

      const newPayment = {
        ...paymentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(paymentsRef, newPayment);

      // Aplicar pago a la factura si está completado
      if (paymentData.status === 'completed') {
        await InvoicesService.applyPayment(
          paymentData.invoiceId,
          paymentData.amount
        );
      }

      logger.info('Payment created', { component: 'PaymentsService' });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating payment', error as Error);
      throw new Error('Error al registrar el pago');
    }
  },

  /**
   * Obtener pago por ID
   * @param paymentId - ID del pago
   * @returns Pago o null
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentDoc = await getDoc(paymentRef);

      if (!paymentDoc.exists()) {
        return null;
      }

      return {
        id: paymentDoc.id,
        ...paymentDoc.data(),
      } as Payment;
    } catch (error) {
      logger.error('Error fetching payment', error as Error);
      throw new Error('Error al obtener el pago');
    }
  },

  /**
   * Obtener pagos de una factura
   * @param invoiceId - ID de la factura
   * @returns Lista de pagos
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('invoiceId', '==', invoiceId),
        orderBy('paymentDate', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
    } catch (error) {
      logger.error('Error fetching invoice payments', error as Error);
      return [];
    }
  },

  /**
   * Obtener pagos de un cliente
   * @param clientId - ID del cliente
   * @returns Lista de pagos
   */
  async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('clientId', '==', clientId),
        orderBy('paymentDate', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
    } catch (error) {
      logger.error('Error fetching client payments', error as Error);
      return [];
    }
  },

  /**
   * Actualizar pago
   * @param paymentId - ID del pago
   * @param updates - Datos a actualizar
   */
  async updatePayment(
    paymentId: string,
    updates: UpdatePaymentInput
  ): Promise<void> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);

      await updateDoc(paymentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      logger.info('Payment updated', { component: 'PaymentsService' });
    } catch (error) {
      logger.error('Error updating payment', error as Error);
      throw new Error('Error al actualizar el pago');
    }
  },

  /**
   * Cancelar un pago
   * Revierte el pago de la factura si estaba completado
   * @param paymentId - ID del pago
   */
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (payment.status === 'cancelled') {
        throw new Error('El pago ya está cancelado');
      }

      // Si el pago estaba completado, revertir en la factura
      if (payment.status === 'completed') {
        const invoice = await InvoicesService.getInvoiceById(
          payment.invoiceId
        );

        if (invoice) {
          const newAmountPaid = Math.max(
            0,
            invoice.amountPaid - payment.amount
          );
          const newAmountDue = invoice.total - newAmountPaid;

          // Determinar nuevo estado
          let newStatus = invoice.status;
          if (newAmountPaid === 0) {
            newStatus = 'sent';
          } else if (newAmountDue > 0) {
            newStatus = 'partially-paid';
          }

          await updateDoc(doc(db, 'invoices', payment.invoiceId), {
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            status: newStatus,
            paidDate: null,
            updatedAt: Timestamp.now(),
          });
        }
      }

      // Actualizar estado del pago
      await this.updatePayment(paymentId, { status: 'cancelled' });

      logger.info('Payment cancelled', { component: 'PaymentsService' });
    } catch (error) {
      logger.error('Error cancelling payment', error as Error);
      throw error;
    }
  },
};
