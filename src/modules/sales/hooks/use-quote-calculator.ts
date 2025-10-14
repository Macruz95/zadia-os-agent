/**
 * ZADIA OS - Quote Calculator Hook
 * 
 * Hook for automatic quote calculations (subtotal, taxes, discounts, total)
 * 
 * @module sales/hooks/use-quote-calculator
 */

import { useMemo } from 'react';
import type { QuoteItem } from '@/modules/sales/types/sales.types';

export interface QuoteCalculatorInput {
  items: Omit<QuoteItem, 'id'>[];
  taxes?: Record<string, number>; // { 'IVA': 13, 'ISR': 2 }
  additionalDiscounts?: number; // Global discount amount
}

export interface QuoteCalculatorResult {
  subtotal: number;
  taxesBreakdown: Record<string, number>; // { 'IVA': 520, 'ISR': 80 }
  totalTaxes: number;
  discounts: number;
  total: number;
  itemsCount: number;
}

export function useQuoteCalculator({
  items,
  taxes = {},
  additionalDiscounts = 0,
}: QuoteCalculatorInput): QuoteCalculatorResult {
  return useMemo(() => {
    // Calculate subtotal from all items
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate taxes breakdown
    const taxesBreakdown: Record<string, number> = {};
    let totalTaxes = 0;

    Object.entries(taxes).forEach(([taxName, rate]) => {
      const taxAmount = (subtotal * rate) / 100;
      taxesBreakdown[taxName] = taxAmount;
      totalTaxes += taxAmount;
    });

    // Calculate total discounts (item-level discounts are already in subtotal)
    const discounts = additionalDiscounts;

    // Calculate final total
    const total = subtotal + totalTaxes - discounts;

    return {
      subtotal,
      taxesBreakdown,
      totalTaxes,
      discounts,
      total,
      itemsCount: items.length,
    };
  }, [items, taxes, additionalDiscounts]);
}

/**
 * Helper function to format currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Helper function to calculate item subtotal
 */
export function calculateItemSubtotal(
  quantity: number,
  unitPrice: number,
  discount: number
): number {
  const baseAmount = quantity * unitPrice;
  const discountAmount = (baseAmount * discount) / 100;
  return baseAmount - discountAmount;
}
