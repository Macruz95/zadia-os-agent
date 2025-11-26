/**
 * ZADIA OS - Inventory Basic Info Fields
 * 
 * Basic information fields for inventory items
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
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
import { 
  RawMaterialCategoryEnum, 
  FinishedProductCategoryEnum, 
  UnitOfMeasureEnum, 
  ProductStatusEnum,
  type RawMaterialCategory,
  type FinishedProductCategory,
  type ProductStatus 
} from '../../types/inventory.types';
import { inventoryUtils } from '../../utils/inventory.utils';
import { DynamicIcon } from '@/lib/icons';

interface BasicInfoFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  type: 'raw-material' | 'finished-product';
}

export function BasicInfoFields({ form, type }: BasicInfoFieldsProps) {
  const isRawMaterial = type === 'raw-material';
  const categoryOptions = isRawMaterial 
    ? RawMaterialCategoryEnum.options
    : FinishedProductCategoryEnum.options;

  const getCategoryIcon = (category: string) => {
    return isRawMaterial 
      ? inventoryUtils.getRawMaterialCategoryIcon(category as RawMaterialCategory)
      : inventoryUtils.getFinishedProductCategoryIcon(category as FinishedProductCategory);
  };

  return (
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
                      <DynamicIcon name={getCategoryIcon(category)} className="h-4 w-4" />
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
                        className={`w-2 h-2 rounded-full bg-${inventoryUtils.getStatusColor(status as ProductStatus)}-500`}
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
  );
}
