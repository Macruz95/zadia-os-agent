import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  type: 'client' | 'lead' | 'opportunity' | 'quote' | 'invoice' | 'project' | 'product' | 'employee' | 'order';
  title: string;
  subtitle?: string;
  url: string;
  icon: string;
  metadata?: Record<string, unknown>;
}

/**
 * Search configuration per collection
 */
interface SearchConfig {
  collection: string;
  type: SearchResult['type'];
  searchFields: string[];
  titleField: string;
  subtitleField?: string;
  urlPrefix: string;
  icon: string;
}

const SEARCH_CONFIGS: SearchConfig[] = [
  {
    collection: 'clients',
    type: 'client',
    searchFields: ['name', 'companyName', 'email', 'phone'],
    titleField: 'name',
    subtitleField: 'email',
    urlPrefix: '/clients',
    icon: 'Users',
  },
  {
    collection: 'leads',
    type: 'lead',
    searchFields: ['name', 'companyName', 'email', 'phone'],
    titleField: 'name',
    subtitleField: 'companyName',
    urlPrefix: '/sales/leads',
    icon: 'UserPlus',
  },
  {
    collection: 'opportunities',
    type: 'opportunity',
    searchFields: ['name', 'title', 'clientName'],
    titleField: 'name',
    subtitleField: 'clientName',
    urlPrefix: '/sales/opportunities',
    icon: 'Target',
  },
  {
    collection: 'quotes',
    type: 'quote',
    searchFields: ['quoteNumber', 'clientName'],
    titleField: 'quoteNumber',
    subtitleField: 'clientName',
    urlPrefix: '/sales/quotes',
    icon: 'FileText',
  },
  {
    collection: 'invoices',
    type: 'invoice',
    searchFields: ['invoiceNumber', 'clientName'],
    titleField: 'invoiceNumber',
    subtitleField: 'clientName',
    urlPrefix: '/finance/invoices',
    icon: 'Receipt',
  },
  {
    collection: 'projects',
    type: 'project',
    searchFields: ['name', 'code', 'clientName'],
    titleField: 'name',
    subtitleField: 'clientName',
    urlPrefix: '/projects',
    icon: 'FolderKanban',
  },
  {
    collection: 'finished-products',
    type: 'product',
    searchFields: ['name', 'sku', 'code'],
    titleField: 'name',
    subtitleField: 'sku',
    urlPrefix: '/inventory/finished-products',
    icon: 'Package',
  },
  {
    collection: 'employees',
    type: 'employee',
    searchFields: ['name', 'email', 'position', 'department'],
    titleField: 'name',
    subtitleField: 'position',
    urlPrefix: '/hr/employees',
    icon: 'UserCog',
  },
  {
    collection: 'orders',
    type: 'order',
    searchFields: ['orderNumber', 'clientName'],
    titleField: 'orderNumber',
    subtitleField: 'clientName',
    urlPrefix: '/orders',
    icon: 'ShoppingCart',
  },
];

/**
 * Search across all collections
 */
export async function globalSearch(
  searchTerm: string,
  tenantId?: string,
  maxResultsPerType: number = 5
): Promise<SearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const searchTermLower = searchTerm.toLowerCase();
  const allResults: SearchResult[] = [];

  try {
    // Search each collection in parallel
    const searchPromises = SEARCH_CONFIGS.map(async (config) => {
      try {
        const results = await searchCollection(
          config,
          searchTermLower,
          tenantId,
          maxResultsPerType
        );
        return results;
      } catch {
        logger.warn(`Search failed for ${config.collection}`, { 
          action: 'globalSearch',
          metadata: { collection: config.collection } 
        });
        return [];
      }
    });

    const resultsArrays = await Promise.all(searchPromises);
    
    for (const results of resultsArrays) {
      allResults.push(...results);
    }

    // Sort by relevance (exact matches first)
    allResults.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTermLower) ? 0 : 1;
      const bExact = b.title.toLowerCase().includes(searchTermLower) ? 0 : 1;
      return aExact - bExact;
    });

    return allResults;
  } catch (error) {
    logger.error('Global search failed', error instanceof Error ? error : undefined);
    return [];
  }
}

/**
 * Search a specific collection
 */
async function searchCollection(
  config: SearchConfig,
  searchTerm: string,
  tenantId?: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  // CRITICAL: Require tenantId for data isolation
  if (!tenantId) {
    return [];
  }
  
  const collectionRef = collection(db, config.collection);
  
  // Build query with tenant isolation
  const baseQuery = query(
    collectionRef,
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(baseQuery);
  const results: SearchResult[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Check if any search field matches
    const matches = config.searchFields.some(field => {
      const value = data[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm);
      }
      return false;
    });

    if (matches) {
      results.push({
        id: doc.id,
        type: config.type,
        title: data[config.titleField] || doc.id,
        subtitle: config.subtitleField ? data[config.subtitleField] : undefined,
        url: `${config.urlPrefix}/${doc.id}`,
        icon: config.icon,
        metadata: {
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
        },
      });

      if (results.length >= maxResults) {
        break;
      }
    }
  }

  return results;
}

/**
 * Get search suggestions based on recent items
 */
export async function getRecentItems(
  tenantId?: string,
  maxItems: number = 10
): Promise<SearchResult[]> {
  // CRITICAL: Require tenantId for data isolation
  if (!tenantId) {
    return [];
  }
  
  const results: SearchResult[] = [];
  
  try {
    // Get 2 recent items from each main collection
    const priorityConfigs = SEARCH_CONFIGS.slice(0, 5); // clients, leads, opportunities, quotes, invoices
    
    for (const config of priorityConfigs) {
      try {
        const collectionRef = collection(db, config.collection);
        const q = query(
          collectionRef,
          where('tenantId', '==', tenantId),
          orderBy('createdAt', 'desc'),
          limit(2)
        );

        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
          const data = doc.data();
          results.push({
            id: doc.id,
            type: config.type,
            title: data[config.titleField] || doc.id,
            subtitle: config.subtitleField ? data[config.subtitleField] : undefined,
            url: `${config.urlPrefix}/${doc.id}`,
            icon: config.icon,
          });
        }
      } catch {
        // Collection might not exist
      }
    }

    return results.slice(0, maxItems);
  } catch (error) {
    logger.error('Failed to get recent items', error instanceof Error ? error : undefined);
    return [];
  }
}
