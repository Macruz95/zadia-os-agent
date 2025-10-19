/**
 * ZADIA OS - Invoice Payments Service
 * Handles payment operations for invoices
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { getInvoiceById } from './invoice-crud.service';

const COLLECTION = 'invoices';

/**
 * Apply payment to invoice
 * Updates amountPaid, amountDue and status
 */
export async function applyPayment(invoiceId: string, amount: number): Promise<void> {
  try {
    const invoice = await getInvoiceById(invoiceId);

    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountDue = invoice.total - newAmountPaid;

    // Determine new status
    let newStatus = invoice.status;
    if (newAmountDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially-paid';
    }

    const invoiceRef = doc(db, COLLECTION, invoiceId);

    await updateDoc(invoiceRef, {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus,
      paidDate: newAmountDue <= 0 ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });

    logger.info('Payment applied to invoice successfully', {
      component: 'InvoicePayments',
      action: 'applyPayment',
      metadata: { invoiceId, amount, newStatus }
    });
  } catch (error) {
    logger.error('Error applying payment', error as Error, {
      component: 'InvoicePayments',
      action: 'applyPayment',
      metadata: { invoiceId, amount }
    });
    throw error;
  }
}
