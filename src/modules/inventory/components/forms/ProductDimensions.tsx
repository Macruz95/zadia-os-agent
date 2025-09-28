/**
 * ZADIA OS - Product Dimensions Component
 * 
 * Form fields for product dimensions (length, width, height, unit)
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { FinishedProductFormData } from '../../validations/inventory.schema';

interface ProductDimensionsProps {
  control: Control<FinishedProductFormData>;
}

const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centímetros (cm)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'inches', label: 'Pulgadas (in)' },
];

export function ProductDimensions({ control }: ProductDimensionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dimensiones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name="dimensions.length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Largo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIMENSION_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}