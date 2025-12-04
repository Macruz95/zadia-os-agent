/**
 * ZADIA OS - Sales Search Module
 * Search invoices, quotes, and opportunities
 */

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { SearchResult } from '@/types/command-bar.types';

/**
 * Search invoices by number or client name
 */
export async function searchInvoices(
  term: string,
  tenantId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    if (!tenantId) return [];

    const q = query(
      collection(db, 'invoices'),
      where('tenantId', '==', tenantId),
      orderBy('invoiceNumber'),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const invoiceNum = data.invoiceNumber?.toLowerCase() || '';
      const clientName = data.clientName?.toLowerCase() || '';

      if (invoiceNum.includes(term) || clientName.includes(term)) {
        results.push({
          id: doc.id,
          type: 'invoice',
          title: `Factura ${data.invoiceNumber || doc.id}`,
          subtitle: `${data.clientName || ''} - ${data.total || 0}€ - ${data.status || ''}`,
          metadata: { total: data.total, status: data.status },
          url: `/invoices/${doc.id}`,
          icon: 'FileText',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Invoice search failed', error as Error);
    return [];
  }
}

/**
 * Search quotes by number or client name
 */
export async function searchQuotes(
  term: string,
  tenantId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    if (!tenantId) return [];

    const q = query(
      collection(db, 'quotes'),
      where('tenantId', '==', tenantId),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const quoteNum = data.quoteNumber?.toLowerCase() || '';
      const clientName = data.clientName?.toLowerCase() || '';

      if (quoteNum.includes(term) || clientName.includes(term)) {
        results.push({
          id: doc.id,
          type: 'quote',
          title: `Cotización ${data.quoteNumber || doc.id}`,
          subtitle: `${data.clientName || ''} - ${data.total || 0}€`,
          metadata: { total: data.total, status: data.status },
          url: `/quotes/${doc.id}`,
          icon: 'FileEdit',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Quote search failed', error as Error);
    return [];
  }
}

/**
 * Search opportunities by title or client name
 */
export async function searchOpportunities(
  term: string,
  tenantId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    if (!tenantId) return [];

    const q = query(
      collection(db, 'opportunities'),
      where('tenantId', '==', tenantId),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const title = data.title?.toLowerCase() || '';
      const clientName = data.clientName?.toLowerCase() || '';

      if (title.includes(term) || clientName.includes(term)) {
        results.push({
          id: doc.id,
          type: 'opportunity',
          title: data.title || 'Oportunidad sin título',
          subtitle: `${data.clientName || ''} - ${data.value || 0}€ - ${data.stage || ''}`,
          metadata: { value: data.value, stage: data.stage },
          url: `/opportunities/${doc.id}`,
          icon: 'Target',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Opportunity search failed', error as Error);
    return [];
  }
}
