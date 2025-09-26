/**
 * ZADIA OS - Movement Data Processor
 * 
 * Processes and validates movement form data
 */

import { Timestamp } from 'firebase/firestore';
import { MovementFormData, InventoryMovement, RawMaterial, FinishedProduct, InventoryLocation } from '../../types';
import { MovementStockCalculator } from './movement-calculator.service';

export class MovementDataProcessor {
  /**
   * Process form data into movement record
   */
  static processMovementData(
    data: MovementFormData,
    item: RawMaterial | FinishedProduct,
    performedBy: string
  ): Omit<InventoryMovement, 'id'> {
    const now = new Date();
    const previousStock = item.currentStock;
    
    // Calculate new stock
    const validation = MovementStockCalculator.validateStockOperation(
      previousStock,
      data.quantity,
      data.movementType,
      data.itemType
    );

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const unitCost = MovementStockCalculator.getUnitCost(item, data.unitCost);

    return {
      itemId: data.itemId,
      itemType: data.itemType,
      itemName: item.name,
      itemSku: item.sku,
      movementType: data.movementType,
      quantity: data.quantity,
      unitCost,
      totalCost: data.quantity * unitCost,
      previousStock,
      newStock: validation.newStock,
      reason: data.reason,
      referenceDocument: data.referenceDocument,
      referenceId: undefined, // Will be set when integrated with production orders
      location: item.location,
      performedBy,
      performedAt: now,
      notes: data.notes,
    };
  }

  /**
   * Convert movement data to Firestore format
   */
  static toFirestoreFormat(movementData: Omit<InventoryMovement, 'id'>): Record<string, unknown> {
    return {
      ...movementData,
      performedAt: Timestamp.fromDate(movementData.performedAt),
    };
  }

  /**
   * Convert Firestore document to InventoryMovement
   */
  static fromFirestoreFormat(doc: { id: string; data: () => Record<string, unknown> }): InventoryMovement {
    const data = doc.data();
    return {
      id: doc.id,
      itemId: data.itemId as string,
      itemType: data.itemType as 'raw-material' | 'finished-product',
      itemName: data.itemName as string,
      itemSku: data.itemSku as string,
      movementType: data.movementType as MovementFormData['movementType'],
      quantity: data.quantity as number,
      unitCost: data.unitCost as number,
      totalCost: data.totalCost as number,
      previousStock: data.previousStock as number,
      newStock: data.newStock as number,
      reason: data.reason as string | undefined,
      referenceDocument: data.referenceDocument as string | undefined,
      referenceId: data.referenceId as string | undefined,
      location: data.location as InventoryLocation,
      performedBy: data.performedBy as string,
      performedAt: (data.performedAt as { toDate(): Date })?.toDate() || new Date(),
      notes: data.notes as string | undefined,
    };
  }
}