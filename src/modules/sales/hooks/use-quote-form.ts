/**
 * ZADIA OS - Use Quote Form Hook
 * 
 * Manages quote form state and calculations
 * REGLA 1: Firebase real (sin mocks)
 * REGLA 3: Zod validation
 * REGLA 4: Modular
 * REGLA 5: <200 líneas
 */

import { useState, useCallback } from 'react';
import { QuoteFormData, QuoteItemData } from '../validations/sales.schema';
import { QuotesService } from '../services/quotes.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseQuoteFormReturn {
  loading: boolean;
  error?: string;
  calculateItemSubtotal: (quantity: number, unitPrice: number, discount: number) => number;
  calculateQuoteTotals: (items: QuoteItemData[], taxes: Record<string, number>, discounts: number) => {
    subtotal: number;
    totalTaxes: number;
    total: number;
  };
  createQuote: (data: Omit<QuoteFormData, 'subtotal' | 'totalTaxes' | 'total' | 'assignedTo'>) => Promise<void>;
}

export function useQuoteForm(): UseQuoteFormReturn {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  /**
   * Calculate item subtotal
   */
  const calculateItemSubtotal = useCallback((
    quantity: number,
    unitPrice: number,
    discount: number
  ): number => {
    const gross = quantity * unitPrice;
    return gross - discount;
  }, []);

  /**
   * Calculate quote totals
   */
  const calculateQuoteTotals = useCallback((
    items: QuoteItemData[],
    taxes: Record<string, number>,
    discounts: number
  ) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate taxes as percentage of subtotal
    const totalTaxes = Object.values(taxes).reduce(
      (sum, rate) => sum + (subtotal * rate / 100),
      0
    );
    
    const total = subtotal + totalTaxes - discounts;

    return {
      subtotal,
      totalTaxes,
      total: Math.max(0, total), // Ensure non-negative
    };
  }, []);

  /**
   * Create new quote
   * REGLA 1: Firebase real
   * REGLA 3: Validated by service
   */
  const createQuote = useCallback(async (
    data: Omit<QuoteFormData, 'subtotal' | 'totalTaxes' | 'total' | 'assignedTo'>
  ) => {
    if (!user) {
      toast.error('Debe iniciar sesión');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      // Calculate totals
      const totals = calculateQuoteTotals(data.items, data.taxes || {}, data.discounts || 0);

      // Create quote data
      const quoteData: QuoteFormData = {
        ...data,
        ...totals,
        assignedTo: user.uid,
        taxes: data.taxes || {},
        discounts: data.discounts || 0,
      };

      // Create in Firebase
      const newQuote = await QuotesService.createQuote(quoteData, user.uid);

      toast.success('Cotización creada exitosamente');
      logger.info('Quote created', { 
        component: 'useQuoteForm'
      });

      // Redirect to quote details
      router.push(`/sales/quotes/${newQuote.id}`);
    } catch (err) {
      const errorMessage = 'Error al crear cotización';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error(errorMessage, err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, router, calculateQuoteTotals]);

  return {
    loading,
    error,
    calculateItemSubtotal,
    calculateQuoteTotals,
    createQuote,
  };
}
