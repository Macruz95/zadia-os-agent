/**
 * ZADIA OS - Invoice Calculations Utility
 * Helper para calcular totales de facturas
 * Rule #5: Max 200 lines
 */

import type { InvoiceItem } from '../types/finance.types';

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Calcula los totales de una factura
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxes: Record<string, number>
): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );

  const taxAmount = Object.values(taxes).reduce(
    (sum, rate) => sum + (subtotal * rate) / 100,
    0
  );

  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}

/**
 * Recalcula el subtotal de un item
 */
export function calculateItemSubtotal(
  quantity: number,
  unitPrice: number,
  discount: number
): number {
  return quantity * unitPrice - discount;
}
