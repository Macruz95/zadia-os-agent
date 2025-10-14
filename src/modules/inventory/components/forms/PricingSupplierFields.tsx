/**
 * ZADIA OS - Inventory Pricing & Supplier Fields
 * 
 * Pricing and supplier fields specific to product type
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PricingSupplierFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  type: 'raw-material' | 'finished-product';
}

export function PricingSupplierFields({ form, type }: PricingSupplierFieldsProps) {
  const isRawMaterial = type === 'raw-material';

  return (
    <div className="space-y-4">
      {!isRawMaterial && (
        <FormField
          control={form.control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio de Venta *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {form.watch('sellingPrice') > 0 && form.watch('unitCost') > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Margen: {(
                      ((form.watch('sellingPrice') - form.watch('unitCost')) / form.watch('sellingPrice')) * 100
                    ).toFixed(1)}%
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isRawMaterial && (
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del proveedor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
