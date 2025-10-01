import { z } from 'zod';
import { RawMaterialCategoryEnum, FinishedProductCategoryEnum, UnitOfMeasureEnum, ProductStatusEnum } from '../types/inventory.types';

/**
 * Raw Material Form Schema
 * Zod validation schema for raw material forms
 */
export const rawMaterialFormSchema = z.object({
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

/**
 * Finished Product Form Schema 
 * Zod validation schema for finished product forms
 */
export const finishedProductFormSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: FinishedProductCategoryEnum,
  unitOfMeasure: UnitOfMeasureEnum,
  unitPrice: z.number().min(0, 'Precio debe ser mayor a 0'),
  productionCost: z.number().min(0, 'Costo de producción debe ser mayor a 0'),
  currentStock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
  minStock: z.number().min(0, 'Stock mínimo debe ser mayor o igual a 0'),
  maxStock: z.number().min(0, 'Stock máximo debe ser mayor o igual a 0'),
  status: ProductStatusEnum,
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

export type RawMaterialFormData = z.infer<typeof rawMaterialFormSchema>;
export type FinishedProductFormData = z.infer<typeof finishedProductFormSchema>;