/**
 * ZADIA OS - Inventory Stock & Cost Fields
 * 
 * Stock and cost fields for inventory items
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
import { inventoryUtils } from '../../utils/inventory.utils';

interface StockCostFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function StockCostFields({ form }: StockCostFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Stock y Costos</h3>
      
      <FormField
        control={form.control}
        name="currentStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Actual *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Mínimo *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Máximo *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="100"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="unitCost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Costo Unitario *</FormLabel>
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
              {form.watch('unitCost') > 0 && form.watch('currentStock') > 0 && (
                <span className="text-sm text-muted-foreground">
                  Valor total: {inventoryUtils.formatTotalValue(
                    form.watch('currentStock'), 
                    form.watch('unitCost')
                  )}
                </span>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
