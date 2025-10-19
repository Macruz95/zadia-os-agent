/**
 * ZADIA OS - Order Client Info Component
 * Información del cliente para pedidos
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderClientInfoProps {
  register: UseFormRegister<OrderFormData>;
  errors: FieldErrors<OrderFormData>;
}

export function OrderClientInfo({ register, errors }: OrderClientInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">ID del Cliente *</Label>
            <Input
              id="clientId"
              {...register('clientId')}
              placeholder="ID del cliente"
            />
            {errors.clientId && (
              <p className="text-sm text-destructive">
                {errors.clientId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente *</Label>
            <Input
              id="clientName"
              {...register('clientName')}
              placeholder="Nombre completo"
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">
                {errors.clientName.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
