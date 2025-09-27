'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { FinishedProductFormData } from '../../../validations/inventory.schema';
import { FinishedProductCategory } from '../../../types';

interface BasicInfoSectionProps {
  form: UseFormReturn<FinishedProductFormData>;
}

const FINISHED_PRODUCT_CATEGORIES: { value: FinishedProductCategory; label: string }[] = [
  { value: 'Dormitorio', label: 'Dormitorio' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Sala', label: 'Sala' },
  { value: 'Cocina', label: 'Cocina' },
  { value: 'Comedor', label: 'Comedor' },
  { value: 'Baño', label: 'Baño' },
  { value: 'Infantil', label: 'Infantil' },
  { value: 'Exterior', label: 'Exterior' },
  { value: 'Otros', label: 'Otros' },
];

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mesa de comedor roble" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FINISHED_PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                  {...field}
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