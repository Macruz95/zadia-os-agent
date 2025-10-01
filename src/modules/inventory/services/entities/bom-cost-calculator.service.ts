/**
 * BOM Cost Calculator Service
 * Handles all cost calculation logic for Bill of Materials
 */

import { BillOfMaterials, BOMItem } from '../../types/inventory.types';
import { RawMaterialCrudService } from './raw-material-crud.service';
import { logger } from '@/lib/logger';

export class BOMCostCalculator {
  /**
   * Calculate total costs for a BOM
   */
  static async calculateBOMCosts(bom: BillOfMaterials): Promise<{
    totalMaterialCost: number;
    totalLaborCost: number;
    totalOverheadCost: number;
    totalCost: number;
  }> {
    try {
      let totalMaterialCost = 0;

      // Calculate material costs
      for (const item of bom.items) {
        const materialCost = await this.calculateItemCost(item);
        totalMaterialCost += materialCost;
      }

      const totalLaborCost = bom.totalLaborCost || 0;
      const totalOverheadCost = bom.totalOverheadCost || 0;
      const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;

      return {
        totalMaterialCost,
        totalLaborCost,
        totalOverheadCost,
        totalCost
      };
    } catch (error) {
      logger.error('Error calculating BOM costs:', error as Error);
      throw new Error('Error al calcular costos del BOM');
    }
  }

  /**
   * Calculate cost for individual BOM item
   */
  static async calculateItemCost(item: BOMItem): Promise<number> {
    try {
      const rawMaterial = await RawMaterialCrudService.getRawMaterialById(item.rawMaterialId);
      if (!rawMaterial) {
        logger.warn(`Raw material not found: ${item.rawMaterialId}`);
        return 0;
      }

      return rawMaterial.unitCost * item.quantity;
    } catch (error) {
      logger.error('Error calculating item cost:', error as Error);
      return 0;
    }
  }

  /**
   * Calculate production cost per unit based on finished product yield
   */
  static calculateUnitCost(bom: BillOfMaterials, yieldQuantity: number = 1): number {
    const totalCost = bom.totalMaterialCost + bom.totalLaborCost + bom.totalOverheadCost;
    return yieldQuantity > 0 ? totalCost / yieldQuantity : totalCost;
  }

  /**
   * Validate if BOM costs are within expected ranges
   */
  static validateCosts(bom: BillOfMaterials, expectedYield: number = 1): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isValid = true;

    // Check for zero or negative costs
    if (bom.totalMaterialCost <= 0) {
      warnings.push('Material cost is zero or negative');
      isValid = false;
    }

    // Check for unusually high costs (over 10000)
    if (bom.totalMaterialCost > 10000) {
      warnings.push('Material cost seems unusually high');
    }

    // Check yield
    if (expectedYield <= 0) {
      warnings.push('Expected yield must be greater than zero');
      isValid = false;
    }

    // Check if total cost is reasonable
    if (bom.totalCost <= 0) {
      warnings.push('Total cost is zero or negative');
      isValid = false;
    }

    return { isValid, warnings };
  }
}