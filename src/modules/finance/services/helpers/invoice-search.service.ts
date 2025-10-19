/**
 * ZADIA OS - Invoice Search Service
 * Handles search and filtering operations for invoices
 */

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Invoice, InvoiceFilters } from '../../types/finance.types';

const COLLECTION = 'invoices';

/**
 * Search invoices with filters
 */
export async function searchInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  try {
    const invoicesRef = collection(db, COLLECTION);
    let q = query(invoicesRef, orderBy('createdAt', 'desc'));

    // Apply filters
    if (filters.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.projectId) {
      q = query(q, where('projectId', '==', filters.projectId));
    }

    // Limit results
    q = query(q, limit(100));

    const snapshot = await getDocs(q);
    let invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];

    // Additional filters (date and overdue)
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
    logger.error('Error searching invoices', error as Error, {
      component: 'InvoiceSearch',
      action: 'searchInvoices',
      metadata: { filters }
    });
    return [];
  }
}
