/**
 * ZADIA OS - Order Notes Component
 * Notas del pedido
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UseFormRegister } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderNotesProps {
  register: UseFormRegister<OrderFormData>;
}

export function OrderNotes({ register }: OrderNotesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          {...register('notes')}
          placeholder="Notas adicionales..."
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
