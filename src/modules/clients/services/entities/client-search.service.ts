import { db } from '../../../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  Query
} from 'firebase/firestore';
import { Client, ClientSearchParams } from '../../types/clients.types';
import { CLIENTS_COLLECTION, docToClient } from '../utils/firestore.utils';

/**
 * Service for searching and filtering client entities
 */
export class ClientSearchService {
  /**
   * Search clients with filters and pagination
   */
  static async searchClients(params: ClientSearchParams): Promise<{
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
  }> {
    let q: Query = collection(db, CLIENTS_COLLECTION);

    // Apply filters first (before sorting to avoid composite indexes)
    if (params.filters) {
      q = this.applyFilters(q, params.filters);
    }

    // Get all matching documents first
    const querySnapshot = await getDocs(q);
    let clients = querySnapshot.docs.map(docToClient);

    // Apply text search in memory if query is provided
    if (params.query && params.query.trim()) {
      const { searchInClient } = await import('../../utils/clients.utils');
      clients = clients.filter(client => searchInClient(client, params.query!));
    }

    // Apply sorting in memory to avoid composite index requirements
    clients = this.sortClients(clients, params);

    // Apply pagination
    const paginatedResult = this.paginateClients(clients, params);

    return paginatedResult;
  }

  /**
   * Apply filters to the query
   */
  private static applyFilters(q: Query, filters: ClientSearchParams['filters']): Query {
    if (!filters) return q;

    const { clientType, status, tags, source } = filters;
    
    // Validate and sanitize clientType
    if (clientType) {
      const validClientTypes = ['PersonaNatural', 'Organización', 'Empresa'];
      if (!validClientTypes.includes(clientType)) {
        throw new Error('Invalid client type filter');
      }
      q = query(q, where('clientType', '==', clientType));
    }
    
    // Validate and sanitize status
    if (status) {
      const validStatuses = ['Prospecto', 'Activo', 'Inactivo'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status filter');
      }
      q = query(q, where('status', '==', status));
    }
    
    // Validate and sanitize source
    if (source) {
      if (typeof source !== 'string' || source.length > 100) {
        throw new Error('Invalid source filter');
      }
      const sanitizedSource = source.trim().substring(0, 100);
      q = query(q, where('source', '==', sanitizedSource));
    }
    
    // Validate and sanitize tags
    if (tags && tags.length > 0) {
      if (!Array.isArray(tags) || tags.length > 10) {
        throw new Error('Invalid tags filter');
      }
      const sanitizedTags = tags.filter(tag => 
        typeof tag === 'string' && tag.length <= 50
      ).map(tag => tag.trim());
      if (sanitizedTags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', sanitizedTags));
      }
    }

    return q;
  }

  /**
   * Sort clients array
   */
  private static sortClients(clients: Client[], params: ClientSearchParams): Client[] {
    const sortBy = params.sortBy || 'lastInteractionDate';
    const sortOrder = params.sortOrder || 'desc';

    // Helper function for safe comparison
    const compareValues = (a: unknown, b: unknown): number => {
      // Handle dates
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
      }

      // Handle strings
      if (typeof a === 'string' && typeof b === 'string') {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        return aLower.localeCompare(bLower);
      }

      // Handle numbers
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }

      // Convert to strings for comparison
      const aStr = String(a || '');
      const bStr = String(b || '');
      return aStr.localeCompare(bStr);
    };

    return clients.sort((a, b) => {
      const aValue = a[sortBy as keyof Client];
      const bValue = b[sortBy as keyof Client];

      const comparison = compareValues(aValue, bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Paginate clients array
   */
  private static paginateClients(clients: Client[], params: ClientSearchParams): {
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
  } {
    const pageSize = params.pageSize || 20;
    const page = params.page || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedClients = clients.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < clients.length;

    return {
      clients: paginatedClients,
      totalCount: clients.length,
      hasMore,
    };
  }
}