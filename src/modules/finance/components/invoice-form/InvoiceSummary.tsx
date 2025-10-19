/**
 * ZADIA OS - Invoice Summary Component
 * Resumen de totales de la factura
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Calculator } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface InvoiceSummaryProps {
  subtotal: number;
  taxes: Record<string, number>;
  total: number;
  currency: string;
}

export function InvoiceSummary({
  subtotal,
  taxes,
  total,
  currency,
}: InvoiceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <CardTitle>Resumen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {Object.entries(taxes).map(([name, rate]) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {name} ({rate}%)
              </span>
              <span className="font-medium">
                {formatCurrency((subtotal * rate) / 100)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Moneda</Label>
          <div className="text-sm font-medium">{currency}</div>
        </div>
      </CardContent>
    </Card>
  );
}
