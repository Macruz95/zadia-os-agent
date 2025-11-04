/**
 * ZADIA OS - Command Search Service
 * 
 * Federated search orchestrator
 * Rule #1: Real Firebase data only
 * Rule #4: Modular architecture
 */

import { logger } from '@/lib/logger';
import type { SearchResults } from '@/types/command-bar.types';
import { searchClients, searchLeads } from './search/clients-search';
import { searchProjects, searchTasks } from './search/projects-search';
import { searchInvoices, searchQuotes, searchOpportunities } from './search/sales-search';

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

      // Parallel search across all modules
      const [
        clients,
        projects,
        invoices,
        quotes,
        opportunities,
        leads,
        tasks,
      ] = await Promise.all([
        searchClients(normalizedTerm, userId, maxResults),
        searchProjects(normalizedTerm, userId, maxResults),
        searchInvoices(normalizedTerm, userId, maxResults),
        searchQuotes(normalizedTerm, userId, maxResults),
        searchOpportunities(normalizedTerm, userId, maxResults),
        searchLeads(normalizedTerm, userId, maxResults),
        searchTasks(normalizedTerm, userId, maxResults),
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
