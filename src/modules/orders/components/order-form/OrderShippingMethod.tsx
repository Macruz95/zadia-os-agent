/**
 * ZADIA OS - Order Shipping Method Component
 * Selección de método de envío
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Truck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SHIPPING_METHOD_CONFIG } from '../../types/orders.types';
import type { OrderFormData } from '../../validations/orders.validation';

interface OrderShippingMethodProps {
  onValueChange: (value: OrderFormData['shippingMethod']) => void;
}

export function OrderShippingMethod({
  onValueChange,
}: OrderShippingMethodProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Método de Envío
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue="standard"
          onValueChange={(value) =>
            onValueChange(
              value as 'pickup' | 'standard' | 'express' | 'overnight'
            )
          }
        >
          {Object.entries(SHIPPING_METHOD_CONFIG).map(([key, config]) => (
            <div
              key={key}
              className="flex items-center space-x-2 p-3 border rounded-lg"
            >
              <RadioGroupItem value={key} id={key} />
              <Label htmlFor={key} className="flex-1 cursor-pointer">
                <p className="font-medium">{config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {config.estimatedDays}
                </p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
