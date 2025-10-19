/**
 * ZADIA OS - Invoice CRUD Service
 * Handles create, read, update operations for invoices
 */

import { collection, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Invoice } from '../../types/finance.types';
import type { CreateInvoiceInput, UpdateInvoiceInput } from '../../validations/finance.validation';

const COLLECTION = 'invoices';

/**
 * Create a new invoice
 */
export async function createInvoice(invoiceData: CreateInvoiceInput): Promise<string> {
  try {
    const invoicesRef = collection(db, COLLECTION);

    const newInvoice = {
      ...invoiceData,
      // Initial values
      amountPaid: 0,
      amountDue: invoiceData.total,
      paidDate: null,
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(invoicesRef, newInvoice);

    logger.info('Invoice created successfully', {
      component: 'InvoiceCRUD',
      action: 'createInvoice',
      metadata: { invoiceId: docRef.id }
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error creating invoice', error as Error, {
      component: 'InvoiceCRUD',
      action: 'createInvoice'
    });
    throw new Error('Error al crear la factura');
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  try {
    const invoiceRef = doc(db, COLLECTION, invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);

    if (!invoiceDoc.exists()) {
      return null;
    }

    return {
      id: invoiceDoc.id,
      ...invoiceDoc.data(),
    } as Invoice;
  } catch (error) {
    logger.error('Error fetching invoice', error as Error, {
      component: 'InvoiceCRUD',
      action: 'getInvoiceById',
      metadata: { invoiceId }
    });
    throw new Error('Error al obtener la factura');
  }
}

/**
 * Update invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: UpdateInvoiceInput
): Promise<void> {
  try {
    const invoiceRef = doc(db, COLLECTION, invoiceId);

    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    logger.info('Invoice updated successfully', {
      component: 'InvoiceCRUD',
      action: 'updateInvoice',
      metadata: { invoiceId }
    });
  } catch (error) {
    logger.error('Error updating invoice', error as Error, {
      component: 'InvoiceCRUD',
      action: 'updateInvoice',
      metadata: { invoiceId }
    });
    throw new Error('Error al actualizar la factura');
  }
}
