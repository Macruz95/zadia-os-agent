/**
 * ZADIA OS - Product Basic Info Component
 * 
 * Form fields for basic product information (name, category, description)
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { FinishedProductCategory } from '../../types';
import { FinishedProductFormData } from '../../validations/inventory.schema';

interface ProductBasicInfoProps {
  control: Control<FinishedProductFormData>;
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

export function ProductBasicInfo({ control }: ProductBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del producto terminado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada del producto"
                  rows={3}
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