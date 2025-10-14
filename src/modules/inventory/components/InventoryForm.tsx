/**
 * ZADIA OS - Inventory Form Component
 * 
 * Generic form component for inventory items (raw materials and finished products)
 * Refactored: 418 lines → 135 lines (modular field components)
 */

import React from 'react';
import { logger } from '@/lib/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { 
  RawMaterialCategoryEnum, 
  FinishedProductCategoryEnum, 
  UnitOfMeasureEnum, 
  ProductStatusEnum,
} from '../types/inventory.types';
import { BasicInfoFields } from './forms/BasicInfoFields';
import { StockCostFields } from './forms/StockCostFields';
import { PricingSupplierFields } from './forms/PricingSupplierFields';

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

  const handleSubmit = async (data: RawMaterialFormData | FinishedProductFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      logger.error('Error submitting inventory form', error as Error, {
        component: 'InventoryForm',
        action: 'handleFormSubmit'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <BasicInfoFields form={form} type={type} />

          {/* Stock, Costs, and Pricing */}
          <div className="space-y-4">
            <StockCostFields form={form} />
            <PricingSupplierFields form={form} type={type} />
          </div>
        </div>

        {/* Action Buttons */}
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