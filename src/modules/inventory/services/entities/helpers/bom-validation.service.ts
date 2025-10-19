/**
 * ZADIA OS - BOM Validation Service
 * Handles validation and feasibility operations for BOMs
 */

import { logger } from '@/lib/logger';
import { BillOfMaterials } from '../../../types/inventory.types';
import { BOMProductionValidator, ProductionFeasibility } from '../bom-production-validator.service';
import { getBOMById } from './bom-crud.service';

/**
 * Get production feasibility
 */
export async function getProductionFeasibility(
  bomId: string,
  quantity: number = 1
): Promise<ProductionFeasibility> {
  try {
    const bom = await getBOMById(bomId);
    if (!bom) {
      throw new Error('BOM not found');
    }

    return await BOMProductionValidator.calculateProductionFeasibility(bom, quantity);
  } catch (error) {
    logger.error('Error calculating production feasibility', error as Error, {
      component: 'BOMValidation',
      action: 'getProductionFeasibility',
      metadata: { bomId, quantity }
    });
    throw new Error('Error al calcular factibilidad de producción');
  }
}

/**
 * Validate BOM items structure
 */
export async function validateBOMItems(items: unknown[]): Promise<unknown> {
  try {
    const tempBOM = { items } as BillOfMaterials;
    return BOMProductionValidator.validateBOMStructure(tempBOM);
  } catch (error) {
    logger.error('Error validating BOM items', error as Error, {
      component: 'BOMValidation',
      action: 'validateBOMItems'
    });
    return {
      isValid: false,
      errors: ['Error validating BOM items'],
      warnings: []
    };
  }
}
