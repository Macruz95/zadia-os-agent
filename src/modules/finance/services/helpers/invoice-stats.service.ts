/**
 * ZADIA OS - Invoice Stats Service
 * Handles statistics calculations for invoices
 */

import { logger } from '@/lib/logger';
import type { InvoiceStats, InvoiceFilters } from '../../types/finance.types';
import { searchInvoices } from './invoice-search.service';

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(clientId?: string): Promise<InvoiceStats> {
  try {
    const filters: InvoiceFilters = {};
    if (clientId) filters.clientId = clientId;

    const invoices = await searchInvoices(filters);

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
    logger.error('Error calculating invoice stats', error as Error, {
      component: 'InvoiceStats',
      action: 'getInvoiceStats',
      metadata: { clientId }
    });
    return {
      totalInvoices: 0,
      totalBilled: 0,
      totalPaid: 0,
      totalDue: 0,
      overdueInvoices: 0,
      overdueAmount: 0,
    };
  }
}
