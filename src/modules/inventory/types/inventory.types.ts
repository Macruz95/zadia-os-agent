import { z } from 'zod';

// Enums
export const RawMaterialCategoryEnum = z.enum([
  'Maderas',
  'Acabados', 
  'Adhesivos',
  'Herrajes',
  'Químicos',
  'Textiles',
  'Herramientas',
  'Otros'
]);
export type RawMaterialCategory = z.infer<typeof RawMaterialCategoryEnum>;

export const FinishedProductCategoryEnum = z.enum([
  'Dormitorio',
  'Oficina',
  'Sala',
  'Cocina',
  'Comedor',
  'Baño',
  'Infantil',
  'Exterior',
  'Otros'
]);
export type FinishedProductCategory = z.infer<typeof FinishedProductCategoryEnum>;

export const UnitOfMeasureEnum = z.enum([
  'unidades',
  'kg',
  'g',
  'lb',
  'oz',
  'litros',
  'ml',
  'gal',
  'm3',
  'm2',
  'm',
  'cm',
  'mm',
  'pies',
  'pulgadas',
  'yardas'
]);
export type UnitOfMeasure = z.infer<typeof UnitOfMeasureEnum>;

export const ProductStatusEnum = z.enum([
  'Disponible',
  'Reservado',
  'Vendido',
  'FueraDeCatalogo',
  'EnProduccion'
]);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

export const MovementTypeEnum = z.enum([
  'Entrada',
  'Salida',
  'Ajuste',
  'Merma',
  'Produccion',
  'Venta',
  'Devolucion'
]);
export type MovementType = z.infer<typeof MovementTypeEnum>;

export const CostingMethodEnum = z.enum([
  'PEPS', // Primero en Entrar, Primero en Salir
  'UEPS', // Último en Entrar, Primero en Salir
  'Promedio'
]);
export type CostingMethod = z.infer<typeof CostingMethodEnum>;

// Base interfaces
export interface InventoryLocation {
  warehouse: string;
  section?: string;
  shelf?: string;
  position?: string;
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: 'cm' | 'm' | 'inches';
}

// Raw Material Interface
export interface RawMaterial {
  id: string;
  sku: string; // SKU interno generado automáticamente
  name: string;
  category: RawMaterialCategory;
  unitOfMeasure: UnitOfMeasure;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  averageCost: number;
  location: InventoryLocation;
  supplierId?: string;
  supplierName?: string;
  description?: string;
  specifications?: string;
  lastPurchaseDate?: Date;
  lastMovementDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Finished Product Interface  
export interface FinishedProduct {
  id: string;
  sku: string;
  name: string;
  category: FinishedProductCategory;
  description?: string;
  dimensions?: Dimensions;
  currentStock: number;
  minimumStock: number;
  unitCost: number; // Calculado automáticamente
  laborCost: number;
  overheadCost: number;
  totalCost: number; // unitCost + laborCost + overheadCost
  suggestedPrice: number;
  sellingPrice: number;
  status: ProductStatus;
  location: InventoryLocation;
  specifications?: string;
  images?: string[];
  lastProductionDate?: Date;
  lastSaleDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface BOMItem {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  totalCost: number;
}

export interface BillOfMaterials {
  id: string;
  finishedProductId: string;
  finishedProductName: string;
  version: number;
  items: BOMItem[];
  totalMaterialCost: number;
  estimatedLaborHours: number;
  laborCostPerHour: number;
  totalLaborCost: number;
  overheadPercentage: number;
  totalOverheadCost: number;
  totalCost: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  itemName: string;
  itemSku: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceDocument?: string;
  referenceId?: string; // ID de orden de producción, venta, etc.
  location: InventoryLocation;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

// Form types that allow undefined for optional numeric fields
export interface RawMaterialFormData {
  name: string;
  category: RawMaterialCategory;
  unitOfMeasure: UnitOfMeasure;
  minimumStock: number;
  unitCost: number;
  location: InventoryLocation;
  supplierId?: string;
  supplierName?: string;
  description?: string;
  specifications?: string;
}

export interface FinishedProductFormData {
  name: string;
  category: FinishedProductCategory;
  description?: string;
  dimensions?: Dimensions;
  minimumStock: number;
  laborCost: number;
  overheadCost: number;
  suggestedPrice: number;
  sellingPrice: number;
  location: InventoryLocation;
  specifications?: string;
}