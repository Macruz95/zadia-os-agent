/**
 * ZADIA OS - Movement Stock Calculator
 * 
 * Calculates new stock values based on movement types
 */

import { MovementType, RawMaterial, FinishedProduct } from '../../types';

export class MovementStockCalculator {
  /**
   * Calculate new stock based on movement type
   */
  static calculateNewStock(
    currentStock: number,
    quantity: number,
    movementType: MovementType,
    itemType: 'raw-material' | 'finished-product'
  ): number {
    switch (movementType) {
      case 'Entrada':
      case 'Devolucion':
        return currentStock + quantity;
      
      case 'Venta':
      case 'Merma':
        return Math.max(0, currentStock - quantity);
      
      case 'Salida':
        return Math.max(0, currentStock - quantity);
      
      case 'Produccion':
        // For production: raw materials decrease, finished products increase
        return itemType === 'raw-material' 
          ? Math.max(0, currentStock - quantity)
          : currentStock + quantity;
      
      case 'Ajuste':
        return quantity; // For adjustments, quantity is the new total
      
      default:
        return currentStock;
    }
  }

  /**
   * Validate stock operation
   */
  static validateStockOperation(
    currentStock: number,
    quantity: number,
    movementType: MovementType,
    itemType: 'raw-material' | 'finished-product'
  ): { isValid: boolean; newStock: number; error?: string } {
    const newStock = this.calculateNewStock(currentStock, quantity, movementType, itemType);
    
    // Check for negative stock (except adjustments)
    if (newStock < 0 && movementType !== 'Ajuste') {
      return {
        isValid: false,
        newStock: currentStock,
        error: `Stock insuficiente. Stock actual: ${currentStock}, cantidad solicitada: ${quantity}`
      };
    }

    return {
      isValid: true,
      newStock
    };
  }

  /**
   * Get unit cost for movement calculation
   */
  static getUnitCost(
    item: RawMaterial | FinishedProduct,
    providedCost?: number
  ): number {
    if (providedCost) {
      return providedCost;
    }

    if ('unitOfMeasure' in item) {
      // Raw material
      return (item as RawMaterial).unitCost;
    } else {
      // Finished product
      return (item as FinishedProduct).totalCost;
    }
  }
}