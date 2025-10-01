/**
 * BOM Production Feasibility Service
 * Handles production calculations and stock validation
 */

import { BillOfMaterials, BOMItem } from '../../types/inventory.types';
import { RawMaterialCrudService } from './raw-material-crud.service';
import { logger } from '@/lib/logger';

export interface ProductionFeasibility {
  canProduce: boolean;
  maxQuantity: number;
  missingMaterials: {
    rawMaterialId: string;
    rawMaterialName: string;
    required: number;
    available: number;
    shortage: number;
  }[];
  warnings: string[];
}

export class BOMProductionValidator {
  /**
   * Calculate production feasibility based on current stock
   */
  static async calculateProductionFeasibility(
    bom: BillOfMaterials,
    requestedQuantity: number = 1
  ): Promise<ProductionFeasibility> {
    try {
      const result: ProductionFeasibility = {
        canProduce: true,
        maxQuantity: 0,
        missingMaterials: [],
        warnings: []
      };

      let maxPossibleQuantity = Infinity;

      // Check each material requirement
      for (const item of bom.items) {
        const materialCheck = await this.checkMaterialAvailability(item, requestedQuantity);
        
        if (!materialCheck.available) {
          result.canProduce = false;
          result.missingMaterials.push({
            rawMaterialId: item.rawMaterialId,
            rawMaterialName: materialCheck.materialName,
            required: materialCheck.requiredQuantity,
            available: materialCheck.availableQuantity,
            shortage: materialCheck.shortage
          });
        }

        // Calculate max quantity based on this material
        const materialMaxQuantity = Math.floor(
          materialCheck.availableQuantity / item.quantity
        );
        maxPossibleQuantity = Math.min(maxPossibleQuantity, materialMaxQuantity);
      }

      result.maxQuantity = maxPossibleQuantity === Infinity ? 0 : maxPossibleQuantity;

      // Add warnings for low stock
      if (result.maxQuantity < requestedQuantity && result.maxQuantity > 0) {
        result.warnings.push(
          `Solo se pueden producir ${result.maxQuantity} unidades de las ${requestedQuantity} solicitadas`
        );
      }

      return result;
    } catch (error) {
      logger.error('Error calculating production feasibility:', error as Error);
      throw new Error('Error al calcular factibilidad de producción');
    }
  }

  /**
   * Check material availability for production
   */
  private static async checkMaterialAvailability(
    item: BOMItem,
    productionQuantity: number
  ): Promise<{
    available: boolean;
    materialName: string;
    requiredQuantity: number;
    availableQuantity: number;
    shortage: number;
  }> {
    try {
      const rawMaterial = await RawMaterialCrudService.getRawMaterialById(item.rawMaterialId);
      
      if (!rawMaterial) {
        return {
          available: false,
          materialName: 'Material no encontrado',
          requiredQuantity: item.quantity * productionQuantity,
          availableQuantity: 0,
          shortage: item.quantity * productionQuantity
        };
      }

      const requiredQuantity = item.quantity * productionQuantity;
      const availableQuantity = rawMaterial.currentStock;
      const shortage = Math.max(0, requiredQuantity - availableQuantity);

      return {
        available: availableQuantity >= requiredQuantity,
        materialName: rawMaterial.name,
        requiredQuantity,
        availableQuantity,
        shortage
      };
    } catch (error) {
      logger.error('Error checking material availability:', error as Error);
      return {
        available: false,
        materialName: 'Error al verificar material',
        requiredQuantity: item.quantity * productionQuantity,
        availableQuantity: 0,
        shortage: item.quantity * productionQuantity
      };
    }
  }

  /**
   * Validate BOM structure and items
   */
  static validateBOMStructure(bom: BillOfMaterials): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!bom.finishedProductId) {
      errors.push('Finished product ID is required');
    }

    if (!bom.items || bom.items.length === 0) {
      errors.push('BOM must have at least one item');
    }

    // Validate each item
    bom.items?.forEach((item, index) => {
      if (!item.rawMaterialId) {
        errors.push(`Item ${index + 1}: Raw material ID is required`);
      }
      
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than zero`);
      }

      if (item.quantity > 1000) {
        warnings.push(`Item ${index + 1}: Very high quantity (${item.quantity})`);
      }
    });

    // Check version
    if (bom.version < 1) {
      errors.push('BOM version must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}