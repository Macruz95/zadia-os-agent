/**
 * ZADIA OS - Order Shipping Address Component
 * Dirección de envío del pedido
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UseFormRegister } from 'react-hook-form';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderShippingAddressProps {
  register: UseFormRegister<OrderFormData>;
}

export function OrderShippingAddress({ register }: OrderShippingAddressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Dirección de Envío
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Calle *</Label>
          <Input
            id="street"
            {...register('shippingAddress.street')}
            placeholder="Calle y número"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad *</Label>
            <Input id="city" {...register('shippingAddress.city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input id="state" {...register('shippingAddress.state')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">Código Postal *</Label>
            <Input id="zipCode" {...register('shippingAddress.zipCode')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País *</Label>
            <Input id="country" {...register('shippingAddress.country')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
