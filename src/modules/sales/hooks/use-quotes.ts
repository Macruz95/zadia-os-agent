/**
 * ZADIA OS - Use Quotes Hook
 * 
 * Manages quotes state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { Quote } from '../types/sales.types';
import { QuoteFormData } from '../validations/sales.schema';
import { QuotesService } from '../services/quotes.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';

interface UseQuotesReturn {
  quotes: Quote[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchQuotes: () => Promise<void>;
  createQuote: (data: QuoteFormData) => Promise<Quote>;
  updateQuote: (id: string, data: Partial<QuoteFormData>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useQuotes(): UseQuotesReturn {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);

  const searchQuotes = useCallback(async () => {
    if (!tenantId) return; // Wait for tenant
    
    try {
      setLoading(true);
      setError(undefined);

      const result = await QuotesService.getQuotes(tenantId);
      setQuotes(result);
      setTotalCount(result.length);
    } catch (err) {
      const errorMessage = 'Error al buscar cotizaciones';
      setError(errorMessage);
      logger.error('Error searching quotes:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Reload when tenant changes
  useEffect(() => {
    if (tenantId) {
      searchQuotes();
    }
  }, [tenantId, searchQuotes]);

  const createQuote = useCallback(async (
    data: QuoteFormData
  ): Promise<Quote> => {
    if (!tenantId) throw new Error('No tenant ID');
    
    try {
      setLoading(true);
      setError(undefined);

      const newQuote = await QuotesService.createQuote(data, user?.uid || '', tenantId);
      
      setQuotes(prev => [newQuote, ...prev]);
      setTotalCount(prev => prev + 1);

      return newQuote;
    } catch (err) {
      const errorMessage = 'Error al crear cotización';
      setError(errorMessage);
      logger.error('Error creating quote:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, tenantId]);

  const updateQuote = useCallback(async (
    id: string,
    data: Partial<QuoteFormData>
  ) => {
    try {
      setError(undefined);

      await QuotesService.updateQuote(id, data);
      
      // Refresh data after update
      await searchQuotes();

      logger.info(`Quote updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar cotización';
      setError(errorMessage);
      logger.error('Error updating quote:', err as Error);
      throw err;
    }
  }, [searchQuotes]);

  const deleteQuote = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await QuotesService.deleteQuote(id);
      
      setQuotes(prev => prev.filter(quote => quote.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Quote deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar cotización';
      setError(errorMessage);
      logger.error('Error deleting quote:', err as Error);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await searchQuotes();
  }, [searchQuotes]);

  return {
    quotes,
    loading,
    error,
    totalCount,
    searchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    refresh,
  };
}