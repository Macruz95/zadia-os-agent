/**
 * ZADIA OS - Clients & Leads Search Module
 * Search clients and leads
 */

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { SearchResult } from '@/types/command-bar.types';

/**
 * Search clients by name, email, or phone
 */
export async function searchClients(
  term: string,
  tenantId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    if (!tenantId) return [];

    const q = query(
      collection(db, 'clients'),
      where('tenantId', '==', tenantId),
      orderBy('name'),
      limit(max * 2) // Fetch extra for client-side filtering
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';
      const email = data.email?.toLowerCase() || '';
      const phone = data.phone?.toLowerCase() || '';

      if (name.includes(term) || email.includes(term) || phone.includes(term)) {
        results.push({
          id: doc.id,
          type: 'client',
          title: data.name || 'Cliente sin nombre',
          subtitle: data.email || data.phone || '',
          metadata: { phone: data.phone, type: data.type },
          url: `/clients/${doc.id}`,
          icon: 'Users',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Client search failed', error as Error);
    return [];
  }
}

/**
 * Search leads by name or company
 */
export async function searchLeads(
  term: string,
  tenantId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    if (!tenantId) return [];

    const q = query(
      collection(db, 'leads'),
      where('tenantId', '==', tenantId),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';
      const company = data.company?.toLowerCase() || '';

      if (name.includes(term) || company.includes(term)) {
        results.push({
          id: doc.id,
          type: 'lead',
          title: data.name || 'Lead sin nombre',
          subtitle: `${data.company || ''} - ${data.email || ''}`,
          metadata: { status: data.status, source: data.source },
          url: `/leads/${doc.id}`,
          icon: 'UserPlus',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Lead search failed', error as Error);
    return [];
  }
}
