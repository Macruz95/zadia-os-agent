/**
 * ZADIA OS - Order Financial Summary Component
 * Resumen financiero del pedido
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UseFormRegister } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderFinancialSummaryProps {
  register: UseFormRegister<OrderFormData>;
  subtotal: number;
  taxAmount: number;
  total: number;
  formatCurrency: (amount: number) => string;
}

export function OrderFinancialSummary({
  register,
  subtotal,
  taxAmount,
  total,
  formatCurrency,
}: OrderFinancialSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumen Financiero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (16%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCost">Costo de Envío</Label>
            <Input
              id="shippingCost"
              type="number"
              step="0.01"
              {...register('shippingCost', {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discounts">Descuentos</Label>
            <Input
              id="discounts"
              type="number"
              step="0.01"
              {...register('discounts', {
                valueAsNumber: true,
              })}
            />
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
