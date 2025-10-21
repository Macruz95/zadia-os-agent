/**
 * ZADIA OS - Quote Summary Section
 * 
 * Displays quote information in conversion dialog
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import type { Quote } from '@/modules/sales/types/sales.types';

interface QuoteSummarySectionProps {
  quote: Quote;
  formatCurrency: (value: number) => string;
}

export function QuoteSummarySection({
  quote,
  formatCurrency,
}: QuoteSummarySectionProps) {
  return (
    <div className="rounded-lg border p-4 bg-muted/50">
      <h3 className="font-semibold mb-3">Resumen de Cotización</h3>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cotización:</span>
          <span className="font-medium">{quote.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cliente:</span>
          <span className="font-medium">{quote.clientId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-lg">{formatCurrency(quote.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items:</span>
          <span className="font-medium">{quote.items.length} productos</span>
        </div>
      </div>
    </div>
  );
}
