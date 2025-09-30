/**
 * ZADIA OS - Inventory Form Component
 * 
 * Generic form component for inventory items (raw materials and finished products)
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RawMaterialCategoryEnum, FinishedProductCategoryEnum, UnitOfMeasureEnum, ProductStatusEnum } from '../types/inventory.types';
import { inventoryUtils } from '../utils/inventory.utils';

// Form schemas
const rawMaterialFormSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: RawMaterialCategoryEnum,
  unitOfMeasure: UnitOfMeasureEnum,
  unitCost: z.number().min(0, 'Costo debe ser mayor a 0'),
  currentStock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
  minStock: z.number().min(0, 'Stock mínimo debe ser mayor o igual a 0'),
  maxStock: z.number().min(0, 'Stock máximo debe ser mayor o igual a 0'),
  supplier: z.string().optional(),
  status: ProductStatusEnum,
});

const finishedProductFormSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: FinishedProductCategoryEnum,
  unitOfMeasure: UnitOfMeasureEnum,
  unitCost: z.number().min(0, 'Costo debe ser mayor a 0'),
  currentStock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
  minStock: z.number().min(0, 'Stock mínimo debe ser mayor o igual a 0'),
  maxStock: z.number().min(0, 'Stock máximo debe ser mayor o igual a 0'),
  sellingPrice: z.number().min(0, 'Precio de venta debe ser mayor a 0'),
  status: ProductStatusEnum,
});

type RawMaterialFormData = z.infer<typeof rawMaterialFormSchema>;
type FinishedProductFormData = z.infer<typeof finishedProductFormSchema>;

interface InventoryFormProps {
  type: 'raw-material' | 'finished-product';
  initialData?: Partial<RawMaterialFormData | FinishedProductFormData>;
  onSubmit: (data: RawMaterialFormData | FinishedProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InventoryForm({
  type,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: InventoryFormProps) {
  const isRawMaterial = type === 'raw-material';
  const schema = isRawMaterial ? rawMaterialFormSchema : finishedProductFormSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: isRawMaterial ? 'Maderas' : 'Dormitorio',
      unitOfMeasure: 'unidades',
      unitCost: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
      status: 'Disponible',
      ...(isRawMaterial ? {} : { sellingPrice: 0 }),
      ...(isRawMaterial ? { supplier: '' } : {}),
      ...initialData,
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const categoryOptions = isRawMaterial 
    ? RawMaterialCategoryEnum.options
    : FinishedProductCategoryEnum.options;

  const getCategoryIcon = (category: string) => {
    return isRawMaterial 
      ? inventoryUtils.getRawMaterialCategoryIcon(category as any)
      : inventoryUtils.getFinishedProductCategoryIcon(category as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del producto"
                      className="resize-none"
                      {...field}
                    />
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
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(category)}</span>
                            <span>{category}</span>
                          </div>
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
              name="unitOfMeasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de Medida *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UnitOfMeasureEnum.options.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ProductStatusEnum.options.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-2 h-2 rounded-full bg-${inventoryUtils.getStatusColor(status as any)}-500`}
                            />
                            <span>{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Información de stock y costos */}
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
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Form>
  );
}