/**
 * ZADIA OS - Command Search Service
 * 
 * Federated search across entire DTO
 * Rule #1: Real Firebase data only
 * Rule #4: Modular architecture
 */

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { SearchResult, SearchResults } from '@/types/command-bar.types';

export class CommandSearchService {
  /**
   * Global search across all collections
   */
  static async search(
    searchTerm: string,
    userId: string,
    maxResults: number = 5
  ): Promise<SearchResults> {
    try {
      const normalizedTerm = searchTerm.toLowerCase().trim();

      if (normalizedTerm.length < 2) {
        return this.emptyResults();
      }

      // Parallel search across all collections
      const [
        clients,
        projects,
        invoices,
        quotes,
        opportunities,
        leads,
        tasks,
      ] = await Promise.all([
        this.searchClients(normalizedTerm, userId, maxResults),
        this.searchProjects(normalizedTerm, userId, maxResults),
        this.searchInvoices(normalizedTerm, userId, maxResults),
        this.searchQuotes(normalizedTerm, userId, maxResults),
        this.searchOpportunities(normalizedTerm, userId, maxResults),
        this.searchLeads(normalizedTerm, userId, maxResults),
        this.searchTasks(normalizedTerm, userId, maxResults),
      ]);

      return {
        clients,
        projects,
        invoices,
        quotes,
        opportunities,
        leads,
        tasks,
        contacts: [], // TODO: Implement when contacts module exists
        documents: [], // TODO: Implement when docs search exists
        expenses: [], // TODO: Implement when expenses module exists
        orders: [], // TODO: Implement when orders module exists
      };
    } catch (error) {
      logger.error('Global search failed', error as Error, {
        component: 'CommandSearchService',
        metadata: { searchTerm, userId }
      });
      return this.emptyResults();
    }
  }

  private static async searchClients(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'clients'),
        where('userId', '==', userId),
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

  private static async searchProjects(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('name'),
        limit(max * 2)
      );

      const snapshot = await getDocs(q);
      const results: SearchResult[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const name = data.name?.toLowerCase() || '';

        if (name.includes(term)) {
          results.push({
            id: doc.id,
            type: 'project',
            title: data.name || 'Proyecto sin nombre',
            subtitle: `${data.status || 'Sin estado'} - ${data.clientName || ''}`,
            metadata: { status: data.status, budget: data.budget },
            url: `/projects/${doc.id}`,
            icon: 'Briefcase',
          });
        }
      });

      return results.slice(0, max);
    } catch (error) {
      logger.error('Project search failed', error as Error);
      return [];
    }
  }

  private static async searchInvoices(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', userId),
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

  private static async searchQuotes(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('userId', '==', userId),
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

  private static async searchOpportunities(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'opportunities'),
        where('userId', '==', userId),
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

  private static async searchLeads(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'leads'),
        where('userId', '==', userId),
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

  private static async searchTasks(
    term: string,
    userId: string,
    max: number
  ): Promise<SearchResult[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        limit(max * 2)
      );

      const snapshot = await getDocs(q);
      const results: SearchResult[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const title = data.title?.toLowerCase() || '';
        const description = data.description?.toLowerCase() || '';

        if (title.includes(term) || description.includes(term)) {
          results.push({
            id: doc.id,
            type: 'task',
            title: data.title || 'Tarea sin título',
            subtitle: `${data.projectName || ''} - ${data.status || ''}`,
            metadata: { status: data.status, priority: data.priority },
            url: `/tasks/${doc.id}`,
            icon: 'CheckSquare',
          });
        }
      });

      return results.slice(0, max);
    } catch (error) {
      logger.error('Task search failed', error as Error);
      return [];
    }
  }

  private static emptyResults(): SearchResults {
    return {
      clients: [],
      projects: [],
      invoices: [],
      quotes: [],
      opportunities: [],
      leads: [],
      tasks: [],
      contacts: [],
      documents: [],
      expenses: [],
      orders: [],
    };
  }
}
