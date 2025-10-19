/**
 * ZADIA OS - Order Dates Component
 * Fechas del pedido
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UseFormRegister } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderDatesProps {
  register: UseFormRegister<OrderFormData>;
}

export function OrderDates({ register }: OrderDatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Fechas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderDate">Fecha del Pedido</Label>
          <Input
            id="orderDate"
            type="date"
            {...register('orderDate', {
              setValueAs: (v) => (v ? new Date(v) : new Date()),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requiredDate">Fecha Requerida</Label>
          <Input
            id="requiredDate"
            type="date"
            {...register('requiredDate', {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
