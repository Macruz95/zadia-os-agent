/**
 * ZADIA OS - Product Costs And Pricing Component
 * 
 * Form fields for product costs and pricing information
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { FinishedProductFormData } from '../../validations/inventory.schema';

interface ProductCostsAndPricingProps {
  control: Control<FinishedProductFormData>;
}

export function ProductCostsAndPricing({ control }: ProductCostsAndPricingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Costos y Precios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="minimumStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Mínimo *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseInt(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="laborCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo de Mano de Obra *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="overheadCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costos Indirectos *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="suggestedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Sugerido *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio de Venta *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}