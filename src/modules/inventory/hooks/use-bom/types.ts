/**
 * ZADIA OS - Use BOM Types
 * Types y interfaces para hook de BOM
 * Rule #5: Max 200 lines per file
 */

import type { BillOfMaterials } from '../../types/inventory.types';

/**
 * Resultado de validación de BOM
 */
export interface BOMValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Viabilidad de producción
 */
export interface ProductionFeasibility {
  canProduce: boolean;
  maxQuantity: number;
  missingMaterials: Array<{
    rawMaterialId: string;
    rawMaterialName: string;
    required: number;
    available: number;
    shortage: number;
  }>;
  warnings: string[];
}

/**
 * Estado del hook useBOM
 */
export interface UseBOMState {
  bom?: BillOfMaterials;
  boms: BillOfMaterials[];
  loading: boolean;
  error?: string;
  validationResult?: BOMValidationResult;
  productionFeasibility?: ProductionFeasibility;
}

/**
 * Acciones del hook useBOM
 */
export interface UseBOMActions {
  createBOM: (
    bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateBOM: (
    id: string,
    bomData: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  deactivateBOM: (id: string) => Promise<void>;
  getBOMsForProduct: (finishedProductId: string) => Promise<void>;
  getActiveBOMForProduct: (finishedProductId: string) => Promise<void>;
  validateBOMItems: (items: import('../../types/inventory.types').BOMItem[]) => Promise<void>;
  calculateProductionFeasibility: (
    bomId: string,
    quantity: number
  ) => Promise<void>;
}

/**
 * Return type completo del hook useBOM
 */
export type UseBOMReturn = UseBOMState & UseBOMActions;
