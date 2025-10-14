/**
 * ZADIA OS - Quote Calculator Summary Component
 * 
 * Displays quote calculation summary (subtotal, taxes, discounts, total)
 * 
 * @component
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { useQuoteCalculator, formatCurrency, type QuoteCalculatorInput } from '@/modules/sales/hooks/use-quote-calculator';

interface QuoteCalculatorSummaryProps extends QuoteCalculatorInput {
  currency?: string;
}

export function QuoteCalculatorSummary({
  items,
  taxes = {},
  additionalDiscounts = 0,
  currency = 'USD',
}: QuoteCalculatorSummaryProps) {
  const calculation = useQuoteCalculator({ items, taxes, additionalDiscounts });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Resumen de Cotización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Items Count */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Items</span>
          <Badge variant="outline">{calculation.itemsCount}</Badge>
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="font-medium">{formatCurrency(calculation.subtotal, currency)}</span>
        </div>

        {/* Taxes Breakdown */}
        {Object.keys(taxes).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Impuestos:</span>
              {Object.entries(calculation.taxesBreakdown).map(([taxName, amount]) => (
                <div key={taxName} className="flex justify-between items-center pl-4">
                  <span className="text-sm text-muted-foreground">
                    {taxName} ({taxes[taxName]}%)
                  </span>
                  <span className="text-sm">{formatCurrency(amount, currency)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center font-medium">
                <span className="text-sm">Total Impuestos</span>
                <span>{formatCurrency(calculation.totalTaxes, currency)}</span>
              </div>
            </div>
          </>
        )}

        {/* Additional Discounts */}
        {additionalDiscounts > 0 && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-orange-600">Descuentos Adicionales</span>
              <span className="font-medium text-orange-600">
                -{formatCurrency(calculation.discounts, currency)}
              </span>
            </div>
          </>
        )}

        <Separator className="my-3" />

        {/* Total */}
        <div className="flex justify-between items-center bg-accent/50 p-3 rounded-lg">
          <span className="text-lg font-bold">TOTAL</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(calculation.total, currency)}
          </span>
        </div>

        {/* Currency Info */}
        <div className="text-center">
          <Badge variant="secondary">{currency}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
