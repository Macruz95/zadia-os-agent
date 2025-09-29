/**
 * ZADIA OS - Use Quotes Hook
 * 
 * Manages quotes state and operations
 */

import { useState, useCallback } from 'react';
import { Quote } from '../types/sales.types';
import { QuotesService } from '../services/quotes.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface UseQuotesReturn {
  quotes: Quote[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchQuotes: () => Promise<void>;
  createQuote: (data: any) => Promise<Quote>;
  updateQuote: (id: string, data: any) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useQuotes(): UseQuotesReturn {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);

  const searchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await QuotesService.getQuotes();
      setQuotes(result);
      setTotalCount(result.length);
    } catch (err) {
      const errorMessage = 'Error al buscar cotizaciones';
      setError(errorMessage);
      logger.error('Error searching quotes:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuote = useCallback(async (
    data: any
  ): Promise<Quote> => {
    try {
      setLoading(true);
      setError(undefined);

      const newQuote = await QuotesService.createQuote(data, user?.uid || '');
      
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
  }, [user?.uid]);

  const updateQuote = useCallback(async (
    id: string,
    data: any
  ) => {
    try {
      setError(undefined);

      await QuotesService.updateQuote(id, data);
      
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? { ...quote, ...data } : quote
      ));

      logger.info(`Quote updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar cotización';
      setError(errorMessage);
      logger.error('Error updating quote:', err as Error);
      throw err;
    }
  }, []);

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