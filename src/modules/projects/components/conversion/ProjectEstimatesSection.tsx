/**
 * ZADIA OS - Project Estimates Section
 * 
 * Displays cost and margin estimates for new project
 * REGLA 2: ShadCN UI
 * REGLA 5: <200 líneas
 */

'use client';

import type { Quote } from '@/modules/sales/types/sales.types';

interface ProjectEstimatesSectionProps {
  quote: Quote;
  estimatedCost: number;
  formatCurrency: (value: number) => string;
}

export function ProjectEstimatesSection({
  quote,
  estimatedCost,
  formatCurrency,
}: ProjectEstimatesSectionProps) {
  const margin = quote.total - estimatedCost;

  return (
    <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
      <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
        Estimaciones del Proyecto
      </h3>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-700 dark:text-blue-300">Precio de Venta:</span>
          <span className="font-bold">{formatCurrency(quote.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700 dark:text-blue-300">Costo Estimado (70%):</span>
          <span className="font-bold">{formatCurrency(estimatedCost)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
          <span className="text-blue-700 dark:text-blue-300">Margen Estimado:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(margin)}
          </span>
        </div>
      </div>
    </div>
  );
}
