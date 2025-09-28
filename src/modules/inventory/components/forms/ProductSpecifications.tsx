/**
 * ZADIA OS - Product Specifications Component
 * 
 * Form field for product technical specifications
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { FinishedProductFormData } from '../../validations/inventory.schema';

interface ProductSpecificationsProps {
  control: Control<FinishedProductFormData>;
}

export function ProductSpecifications({ control }: ProductSpecificationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Especificaciones Técnicas</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especificaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Especificaciones técnicas, materiales, acabados, instrucciones de cuidado, etc."
                  rows={4}
                  {...field}
                  value={field.value || ''}
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