/**
 * ZADIA OS - Use Quote Hook
 * 
 * Hook for managing single quote operations
 * REGLA 1: Firebase real
 * REGLA 3: Zod validation
 * REGLA 4: Modular
 * REGLA 5: <200 líneas
 */

import { useState, useEffect, useCallback } from 'react';
import { Quote, QuoteStatus } from '../types/sales.types';
import { QuotesService } from '../services/quotes.service';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface UseQuoteReturn {
  quote: Quote | null;
  loading: boolean;
  error?: string;
  refreshQuote: () => Promise<void>;
  updateStatus: (status: QuoteStatus) => Promise<void>;
  markAsSent: () => Promise<void>;
  markAsAccepted: () => Promise<void>;
  markAsRejected: () => Promise<void>;
}

export function useQuote(quoteId: string): UseQuoteReturn {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  /**
   * Fetch quote by ID
   * REGLA 1: Firebase real
   */
  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const fetchedQuote = await QuotesService.getQuoteById(quoteId);
      
      if (!fetchedQuote) {
        setError('Cotización no encontrada');
        return;
      }

      setQuote(fetchedQuote);
      logger.info('Quote loaded', { component: 'useQuote' });
    } catch (err) {
      const errorMessage = 'Error al cargar cotización';
      setError(errorMessage);
      logger.error(errorMessage, err as Error);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  /**
   * Refresh quote data
   */
  const refreshQuote = useCallback(async () => {
    await fetchQuote();
  }, [fetchQuote]);

  /**
   * Update quote status
   * REGLA 1: Firebase real
   */
  const updateStatus = useCallback(async (status: QuoteStatus) => {
    if (!quote) return;

    try {
      await QuotesService.updateQuoteStatus(quote.id, status);
      toast.success(`Cotización marcada como ${status}`);
      await refreshQuote();
    } catch (err) {
      const errorMessage = 'Error al actualizar estado';
      toast.error(errorMessage);
      logger.error(errorMessage, err as Error);
    }
  }, [quote, refreshQuote]);

  /**
   * Mark quote as sent
   */
  const markAsSent = useCallback(async () => {
    await updateStatus('sent');
  }, [updateStatus]);

  /**
   * Mark quote as accepted
   */
  const markAsAccepted = useCallback(async () => {
    await updateStatus('accepted');
  }, [updateStatus]);

  /**
   * Mark quote as rejected
   */
  const markAsRejected = useCallback(async () => {
    await updateStatus('rejected');
  }, [updateStatus]);

  // Load quote on mount
  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId, fetchQuote]);

  return {
    quote,
    loading,
    error,
    refreshQuote,
    updateStatus,
    markAsSent,
    markAsAccepted,
    markAsRejected,
  };
}
