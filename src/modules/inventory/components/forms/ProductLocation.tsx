/**
 * ZADIA OS - Product Location Component
 * 
 * Form fields for product warehouse location information
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { FinishedProductFormData } from '../../validations/inventory.schema';

interface ProductLocationProps {
  control: Control<FinishedProductFormData>;
}

export function ProductLocation({ control }: ProductLocationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={control}
            name="location.warehouse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bodega *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Almacén A"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="location.section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Sección 1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="location.shelf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estante</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Estante 3"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="location.position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posición</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: B2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}