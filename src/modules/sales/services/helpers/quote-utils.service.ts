/**
 * ZADIA OS - Quote Utils Service
 * Utilidades para cotizaciones
 * Rule #5: Max 200 lines per file
 */

import type { Quote } from '../../types/sales.types';

/**
 * Generar número de cotización automático
 * Formato: COT-YYYY-MM-XXXXXX
 */
export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `COT-${year}-${month}-${timestamp}`;
}

/**
 * Agregar IDs únicos a los items de la cotización
 */
export function addIdsToItems(
  items: Omit<Quote['items'][0], 'id'>[]
): Quote['items'] {
  return items.map((item, index) => ({
    ...item,
    id: `item-${Date.now()}-${index}`
  }));
}

/**
 * Calcular totales de la cotización
 */
export function calculateTotals(
  items: Quote['items'] | Omit<Quote['items'][0], 'id'>[],
  taxes: Record<string, number>,
  discounts: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalTaxes = Object.values(taxes).reduce(
    (sum, rate) => sum + (subtotal * rate / 100),
    0
  );
  const total = subtotal + totalTaxes - discounts;

  return {
    subtotal,
    totalTaxes,
    total
  };
}
