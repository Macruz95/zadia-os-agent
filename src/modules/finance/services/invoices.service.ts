/**// src/modules/finance/services/invoices.service.ts

 * ZADIA OS - Invoices Service (Facade)

 * Punto de entrada unificado para operaciones de facturasimport {

 * Rule #5: Max 200 lines per file  collection,

 */  doc,

  getDoc,

// CRUD Operations  getDocs,

export {  addDoc,

  createInvoice,  updateDoc,

  getInvoiceById,  query,

  updateInvoice  where,

} from './helpers/invoice-crud.service';  orderBy,

  limit,

// Search Operations  Timestamp,

export {} from 'firebase/firestore';

  searchInvoicesimport { db } from '@/lib/firebase';

} from './helpers/invoice-search.service';import { logger } from '@/lib/logger';

import type {

// Payment Operations  Invoice,

export {  InvoiceFilters,

  applyPayment  InvoiceStats,

} from './helpers/invoice-payments.service';} from '../types/finance.types';

import type {

// Statistics  CreateInvoiceInput,

export {  UpdateInvoiceInput,

  getInvoiceStats} from '../validations/finance.validation';

} from './helpers/invoice-stats.service';

/**

// Utilities * Servicio de Facturas

export { * Maneja todas las operaciones CRUD con Firebase Firestore

  generateInvoiceNumber * NO usa mocks ni datos hardcodeados

} from './helpers/invoice-utils.service'; */

export const InvoicesService = {

/**  /**

 * InvoicesService Object - Backward Compatibility   * Crear una nueva factura

 */   * @param invoiceData - Datos validados con Zod

import * as InvoiceCRUD from './helpers/invoice-crud.service';   * @returns ID de la factura creada

import * as InvoiceSearch from './helpers/invoice-search.service';   */

import * as InvoicePayments from './helpers/invoice-payments.service';  async createInvoice(invoiceData: CreateInvoiceInput): Promise<string> {

import * as InvoiceStats from './helpers/invoice-stats.service';    try {

import * as InvoiceUtils from './helpers/invoice-utils.service';      const invoicesRef = collection(db, 'invoices');



export const InvoicesService = {      const newInvoice = {

  createInvoice: InvoiceCRUD.createInvoice,        ...invoiceData,

  getInvoiceById: InvoiceCRUD.getInvoiceById,        // Valores iniciales

  updateInvoice: InvoiceCRUD.updateInvoice,        amountPaid: 0,

  searchInvoices: InvoiceSearch.searchInvoices,        amountDue: invoiceData.total,

  applyPayment: InvoicePayments.applyPayment,        paidDate: null,

  getInvoiceStats: InvoiceStats.getInvoiceStats,        // Timestamps

  generateInvoiceNumber: InvoiceUtils.generateInvoiceNumber,        createdAt: Timestamp.now(),

};        updatedAt: Timestamp.now(),

      };

      const docRef = await addDoc(invoicesRef, newInvoice);

      logger.info('Invoice created', { component: 'InvoicesService' });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating invoice', error as Error);
      throw new Error('Error al crear la factura');
    }
  },

  /**
   * Obtener factura por ID
   * @param invoiceId - ID de la factura
   * @returns Factura o null si no existe
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);

      if (!invoiceDoc.exists()) {
        return null;
      }

      return {
        id: invoiceDoc.id,
        ...invoiceDoc.data(),
      } as Invoice;
    } catch (error) {
      logger.error('Error fetching invoice', error as Error);
      throw new Error('Error al obtener la factura');
    }
  },

  /**
   * Buscar facturas con filtros
   * @param filters - Filtros opcionales
   * @returns Lista de facturas
   */
  async searchInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
    try {
      const invoicesRef = collection(db, 'invoices');
      let q = query(invoicesRef, orderBy('createdAt', 'desc'));

      // Aplicar filtros
      if (filters.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId));
      }

      // Limitar resultados
      q = query(q, limit(100));

      const snapshot = await getDocs(q);
      let invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Invoice[];

      // Filtros adicionales (fecha y vencidas)
      if (filters.startDate) {
        invoices = invoices.filter(
          (inv) => inv.issueDate.toDate() >= filters.startDate!
        );
      }
      if (filters.endDate) {
        invoices = invoices.filter(
          (inv) => inv.issueDate.toDate() <= filters.endDate!
        );
      }
      if (filters.overdue) {
        const now = new Date();
        invoices = invoices.filter(
          (inv) =>
            inv.status !== 'paid' &&
            inv.status !== 'cancelled' &&
            inv.dueDate.toDate() < now
        );
      }

      return invoices;
    } catch (error) {
      logger.error('Error searching invoices', error as Error);
      return [];
    }
  },

  /**
   * Actualizar factura
   * @param invoiceId - ID de la factura
   * @param updates - Datos a actualizar
   */
  async updateInvoice(
    invoiceId: string,
    updates: UpdateInvoiceInput
  ): Promise<void> {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);

      await updateDoc(invoiceRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      logger.info('Invoice updated', { component: 'InvoicesService' });
    } catch (error) {
      logger.error('Error updating invoice', error as Error);
      throw new Error('Error al actualizar la factura');
    }
  },

  /**
   * Aplicar pago a factura
   * Actualiza amountPaid, amountDue y status
   * @param invoiceId - ID de la factura
   * @param amount - Monto del pago
   */
  async applyPayment(invoiceId: string, amount: number): Promise<void> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);

      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      const newAmountPaid = invoice.amountPaid + amount;
      const newAmountDue = invoice.total - newAmountPaid;

      // Determinar nuevo estado
      let newStatus = invoice.status;
      if (newAmountDue <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'partially-paid';
      }

      const invoiceRef = doc(db, 'invoices', invoiceId);

      await updateDoc(invoiceRef, {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
        paidDate: newAmountDue <= 0 ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });

      logger.info('Payment applied to invoice', { component: 'InvoicesService' });
    } catch (error) {
      logger.error('Error applying payment', error as Error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de facturación
   * @param clientId - ID del cliente (opcional)
   * @returns Estadísticas calculadas
   */
  async getInvoiceStats(clientId?: string): Promise<InvoiceStats> {
    try {
      const filters: InvoiceFilters = {};
      if (clientId) filters.clientId = clientId;

      const invoices = await this.searchInvoices(filters);

      const now = new Date();
      const stats: InvoiceStats = {
        totalInvoices: invoices.length,
        totalBilled: 0,
        totalPaid: 0,
        totalDue: 0,
        overdueInvoices: 0,
        overdueAmount: 0,
      };

      invoices.forEach((invoice) => {
        if (invoice.status !== 'cancelled') {
          stats.totalBilled += invoice.total;
          stats.totalPaid += invoice.amountPaid;
          stats.totalDue += invoice.amountDue;

          if (
            invoice.status !== 'paid' &&
            invoice.dueDate.toDate() < now
          ) {
            stats.overdueInvoices++;
            stats.overdueAmount += invoice.amountDue;
          }
        }
      });

      return stats;
    } catch (error) {
      logger.error('Error calculating invoice stats', error as Error);
      return {
        totalInvoices: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalDue: 0,
        overdueInvoices: 0,
        overdueAmount: 0,
      };
    }
  },

  /**
   * Generar número de factura automático
   * @returns Número de factura (INV-YYYY-NNN)
   */
  async generateInvoiceNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const invoicesRef = collection(db, 'invoices');
      
      // Buscar última factura del año
      const q = query(
        invoicesRef,
        where('number', '>=', `INV-${year}-`),
        where('number', '<', `INV-${year + 1}-`),
        orderBy('number', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return `INV-${year}-001`;
      }

      const lastNumber = snapshot.docs[0].data().number as string;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      const nextSequence = (lastSequence + 1).toString().padStart(3, '0');

      return `INV-${year}-${nextSequence}`;
    } catch (error) {
      logger.error('Error generating invoice number', error as Error);
      // Fallback: usar timestamp
      const year = new Date().getFullYear();
      const sequence = Date.now().toString().slice(-3);
      return `INV-${year}-${sequence}`;
    }
  },
};
