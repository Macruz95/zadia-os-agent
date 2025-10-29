'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface QuoteCalculation {
  subtotal: number;
  totalTaxes: number;
  taxesBreakdown: Record<string, number>;
  total: number;
}

interface QuoteReviewTotalsProps {
  calculation: QuoteCalculation;
  taxes: Record<string, number>;
  additionalDiscounts: number;
  currency: string;
}

export function QuoteReviewTotals({ 
  calculation, 
  taxes, 
  additionalDiscounts, 
  currency 
}: QuoteReviewTotalsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Totales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
        </div>

        {Object.keys(taxes).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Impuestos:</p>
              {Object.entries(calculation.taxesBreakdown).map(([name, amount]) => (
                <div key={name} className="flex justify-between text-sm pl-4">
                  <span className="text-muted-foreground">
                    {name} ({taxes[name]}%)
                  </span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium">
                <span>Total Impuestos</span>
                <span>{formatCurrency(calculation.totalTaxes)}</span>
              </div>
            </div>
          </>
        )}

        {additionalDiscounts > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-orange-600">
              <span>Descuentos Adicionales</span>
              <span>-{formatCurrency(additionalDiscounts)}</span>
            </div>
          </>
        )}

        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(calculation.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}