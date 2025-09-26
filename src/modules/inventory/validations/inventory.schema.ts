import { z } from 'zod';

// Re-export enums from types
export {
  RawMaterialCategoryEnum,
  FinishedProductCategoryEnum,
  UnitOfMeasureEnum,
  ProductStatusEnum,
  MovementTypeEnum,
  CostingMethodEnum
} from '../types/inventory.types';

// Inventory Location Schema
export const InventoryLocationSchema = z.object({
  warehouse: z.string().min(1, 'Bodega es requerida'),
  section: z.string().optional(),
  shelf: z.string().optional(),
  position: z.string().optional(),
});

// Dimensions Schema
export const DimensionsSchema = z.object({
  length: z.number().positive('Largo debe ser positivo').optional(),
  width: z.number().positive('Ancho debe ser positivo').optional(),
  height: z.number().positive('Alto debe ser positivo').optional(),
  unit: z.enum(['cm', 'm', 'inches']),
});

// Raw Material Schema
export const RawMaterialSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre muy largo'),
  category: z.enum(['Maderas', 'Acabados', 'Adhesivos', 'Herrajes', 'Químicos', 'Textiles', 'Herramientas', 'Otros']),
  unitOfMeasure: z.enum(['unidades', 'kg', 'g', 'litros', 'ml', 'm3', 'm2', 'm', 'cm', 'pies']),
  minimumStock: z.number().min(0, 'Stock mínimo no puede ser negativo'),
  unitCost: z.number().positive('Costo unitario debe ser positivo'),
  location: InventoryLocationSchema,
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  description: z.string().max(500, 'Descripción muy larga').optional(),
  specifications: z.string().max(1000, 'Especificaciones muy largas').optional(),
}).refine((data) => {
  // Si hay supplierId debe haber supplierName y viceversa
  if (data.supplierId && !data.supplierName) {
    return false;
  }
  if (data.supplierName && !data.supplierId) {
    return false;
  }
  return true;
}, {
  message: 'Si especifica un proveedor, debe incluir tanto ID como nombre',
  path: ['supplierName'],
});

// Finished Product Schema
export const FinishedProductSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre muy largo'),
  category: z.enum(['Dormitorio', 'Oficina', 'Sala', 'Cocina', 'Comedor', 'Baño', 'Infantil', 'Exterior', 'Otros']),
  description: z.string().max(500, 'Descripción muy larga').optional(),
  dimensions: DimensionsSchema.optional(),
  minimumStock: z.number().min(0, 'Stock mínimo no puede ser negativo'),
  laborCost: z.number().min(0, 'Costo de mano de obra no puede ser negativo'),
  overheadCost: z.number().min(0, 'Gastos indirectos no pueden ser negativos'),
  suggestedPrice: z.number().positive('Precio sugerido debe ser positivo'),
  sellingPrice: z.number().positive('Precio de venta debe ser positivo'),
  location: InventoryLocationSchema,
  specifications: z.string().max(1000, 'Especificaciones muy largas').optional(),
}).refine((data) => {
  // El precio de venta no puede ser menor al precio sugerido
  return data.sellingPrice >= data.suggestedPrice;
}, {
  message: 'El precio de venta no puede ser menor al precio sugerido',
  path: ['sellingPrice'],
});

// BOM Item Schema
export const BOMItemSchema = z.object({
  rawMaterialId: z.string().min(1, 'ID de materia prima requerido'),
  rawMaterialName: z.string().min(1, 'Nombre de materia prima requerido'),
  quantity: z.number().positive('Cantidad debe ser positiva'),
  unitOfMeasure: z.enum(['unidades', 'kg', 'g', 'litros', 'ml', 'm3', 'm2', 'm', 'cm', 'pies']),
  unitCost: z.number().positive('Costo unitario debe ser positivo'),
});

// Bill of Materials Schema
export const BillOfMaterialsSchema = z.object({
  finishedProductId: z.string().min(1, 'ID de producto terminado requerido'),
  finishedProductName: z.string().min(1, 'Nombre de producto terminado requerido'),
  version: z.number().int().positive('Versión debe ser un número entero positivo'),
  items: z.array(BOMItemSchema).min(1, 'Debe incluir al menos un material'),
  estimatedLaborHours: z.number().min(0, 'Horas de mano de obra no pueden ser negativas'),
  laborCostPerHour: z.number().min(0, 'Costo por hora no puede ser negativo'),
  overheadPercentage: z.number().min(0).max(100, 'Porcentaje de gastos indirectos debe estar entre 0 y 100'),
  notes: z.string().max(1000, 'Notas muy largas').optional(),
});

// Movement Schema
export const MovementSchema = z.object({
  itemId: z.string().min(1, 'ID del ítem es requerido'),
  itemType: z.enum(['raw-material', 'finished-product']),
  movementType: z.enum(['Entrada', 'Salida', 'Ajuste', 'Merma', 'Produccion', 'Venta', 'Devolucion']),
  quantity: z.number().positive('Cantidad debe ser positiva'),
  unitCost: z.number().positive('Costo unitario debe ser positivo').optional(),
  reason: z.string().max(200, 'Razón muy larga').optional(),
  referenceDocument: z.string().max(50, 'Referencia muy larga').optional(),
  notes: z.string().max(500, 'Notas muy largas').optional(),
});

// Filter Schemas
export const InventoryFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['Disponible', 'Reservado', 'Vendido', 'FueraDeCatalogo', 'EnProduccion']).optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  lowStock: z.boolean().optional(),
  itemType: z.enum(['raw-material', 'finished-product']).optional(),
});

export const InventorySearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: InventoryFiltersSchema.optional(),
  sortBy: z.enum(['name', 'sku', 'currentStock', 'unitCost', 'lastMovementDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

// Form Schemas
export const RawMaterialFormSchema = RawMaterialSchema;
export const FinishedProductFormSchema = FinishedProductSchema.merge(z.object({
  billOfMaterials: z.array(BOMItemSchema.omit({ unitCost: true, rawMaterialName: true })).optional(),
}));
export const MovementFormSchema = MovementSchema;

// Inventory Movement Schema for forms
export const inventoryMovementSchema = z.object({
  itemId: z.string().min(1, 'ID del artículo es requerido'),
  itemType: z.enum(['raw-material', 'finished-product']),
  itemName: z.string().min(1, 'Nombre del artículo es requerido'),
  itemSku: z.string().min(1, 'SKU del artículo es requerido'),
  movementType: z.enum(['Entrada', 'Salida', 'Ajuste', 'Merma', 'Produccion', 'Venta', 'Devolucion']),
  quantity: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0'),
  reason: z.string().optional(),
  performedBy: z.string().min(1, 'Usuario que realiza el movimiento es requerido'),
});

// Type exports
export type InventoryLocation = z.infer<typeof InventoryLocationSchema>;
export type Dimensions = z.infer<typeof DimensionsSchema>;
export type RawMaterialFormData = z.infer<typeof RawMaterialFormSchema>;
export type FinishedProductFormData = z.infer<typeof FinishedProductFormSchema>;
export type BOMItemFormData = z.infer<typeof BOMItemSchema>;
export type BillOfMaterialsFormData = z.infer<typeof BillOfMaterialsSchema>;
export type MovementFormData = z.infer<typeof MovementFormSchema>;
export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;
export type InventoryFilters = z.infer<typeof InventoryFiltersSchema>;
export type InventorySearchParams = z.infer<typeof InventorySearchParamsSchema>;