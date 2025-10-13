import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface StockFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  showUnitCost?: boolean;
  showUnitPrice?: boolean;
  showProductionCost?: boolean;
}

/**
 * Stock and pricing fields for inventory forms
 * Handles stock levels and cost/price inputs
 */
export function StockFields({ 
  control, 
  showUnitCost = false, 
  showUnitPrice = false, 
  showProductionCost = false 
}: StockFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {showUnitCost && (
        <FormField
          control={control}
          name="unitCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo Unitario *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showUnitPrice && (
        <FormField
          control={control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Unitario *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showProductionCost && (
        <FormField
          control={control}
          name="productionCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo de Producción *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="currentStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Actual *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="minStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Mínimo *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="maxStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Máximo *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}