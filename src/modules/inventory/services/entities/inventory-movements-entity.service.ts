/**
 * ZADIA OS - Inventory Movements Entity Service
 * 
 * Handles all Firebase operations for inventory movements
 * Manages stock changes, auditing, and movement history
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  InventoryMovement,
  MovementFormData,
  RawMaterial,
  FinishedProduct
} from '../../types';
import { RawMaterialsService } from './raw-materials-entity.service';
import { FinishedProductsService } from './finished-products-entity.service';

const COLLECTION_NAME = 'inventory-movements';

export class InventoryMovementsService {
  /**
   * Create a new inventory movement and update stock
   */
  static async createMovement(
    data: MovementFormData,
    performedBy: string
  ): Promise<InventoryMovement> {
    const batch = writeBatch(db);
    
    try {
      // Get current item to calculate new stock
      let currentItem: RawMaterial | FinishedProduct | null = null;
      
      if (data.itemType === 'raw-material') {
        currentItem = await RawMaterialsService.getRawMaterialById(data.itemId);
      } else {
        currentItem = await FinishedProductsService.getFinishedProductById(data.itemId);
      }

      if (!currentItem) {
        throw new Error('Ítem no encontrado');
      }

      // Calculate new stock based on movement type
      let newStock = currentItem.currentStock;
      const previousStock = currentItem.currentStock;

      switch (data.movementType) {
        case 'Entrada':
        case 'Devolucion':
          newStock += data.quantity;
          break;
        case 'Salida':
        case 'Merma':
        case 'Produccion':
        case 'Venta':
          newStock -= data.quantity;
          break;
        case 'Ajuste':
          newStock = data.quantity; // For adjustments, quantity is the new total
          break;
      }

      // Validate stock doesn't go negative
      if (newStock < 0) {
        throw new Error(`Stock insuficiente. Stock actual: ${currentItem.currentStock}, cantidad solicitada: ${data.quantity}`);
      }

      const now = new Date();
      const unitCost = data.unitCost || (data.itemType === 'raw-material' ? (currentItem as RawMaterial).unitCost : (currentItem as FinishedProduct).totalCost);

      // Create movement record
      const movementData = {
        itemId: data.itemId,
        itemType: data.itemType,
        itemName: currentItem.name,
        itemSku: currentItem.sku,
        movementType: data.movementType,
        quantity: data.quantity,
        unitCost,
        totalCost: data.quantity * unitCost,
        previousStock,
        newStock,
        reason: data.reason,
        referenceDocument: data.referenceDocument,
        referenceId: undefined, // Will be set when integrated with production orders
        location: currentItem.location,
        performedBy,
        performedAt: Timestamp.fromDate(now),
        notes: data.notes,
      };

      // Add movement document
      const movementRef = await addDoc(collection(db, COLLECTION_NAME), movementData);

      // Update item stock
      if (data.itemType === 'raw-material') {
        const itemRef = doc(db, 'raw-materials', data.itemId);
        batch.update(itemRef, {
          currentStock: newStock,
          lastMovementDate: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
          updatedBy: performedBy
        });
      } else {
        const itemRef = doc(db, 'finished-products', data.itemId);
        batch.update(itemRef, {
          currentStock: newStock,
          updatedAt: Timestamp.fromDate(now),
          updatedBy: performedBy
        });
      }

      // Commit batch
      await batch.commit();

      const newMovement: InventoryMovement = {
        id: movementRef.id,
        ...movementData,
        performedAt: now,
      };

      logger.info(`Inventory movement created: ${data.movementType} of ${data.quantity} for ${currentItem.name}`);
      return newMovement;

    } catch (error) {
      logger.error('Error creating inventory movement:', error as Error);
      throw new Error('Error al crear movimiento de inventario');
    }
  }

  /**
   * Get movement by ID
   */
  static async getMovementById(id: string): Promise<InventoryMovement | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        performedAt: data.performedAt?.toDate() || new Date(),
      } as InventoryMovement;

    } catch (error) {
      logger.error('Error getting inventory movement:', error as Error);
      throw new Error('Error al obtener movimiento de inventario');
    }
  }

  /**
   * Get movements for specific item
   */
  static async getMovementsByItem(
    itemId: string,
    itemType?: 'raw-material' | 'finished-product',
    limitCount = 50
  ): Promise<InventoryMovement[]> {
    try {
      const whereConstraints = [where('itemId', '==', itemId)];
      
      if (itemType) {
        whereConstraints.push(where('itemType', '==', itemType));
      }
      
      const allConstraints = [
        ...whereConstraints,
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      ];

      const q = query(collection(db, COLLECTION_NAME), ...allConstraints);
      const querySnapshot = await getDocs(q);

      const movements = querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          performedAt: (data.performedAt as Timestamp)?.toDate() || new Date(),
        } as InventoryMovement;
      });

      return movements;

    } catch (error) {
      logger.error('Error getting movements by item:', error as Error);
      throw new Error('Error al obtener movimientos del ítem');
    }
  }

  /**
   * Get recent movements across all items
   */
  static async getRecentMovements(limitCount = 20): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const movements = querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          performedAt: (data.performedAt as Timestamp)?.toDate() || new Date(),
        } as InventoryMovement;
      });

      return movements;

    } catch (error) {
      logger.error('Error getting recent movements:', error as Error);
      throw new Error('Error al obtener movimientos recientes');
    }
  }

  /**
   * Get movements by type
   */
  static async getMovementsByType(
    movementType: string,
    startDate?: Date,
    endDate?: Date,
    limitCount = 100
  ): Promise<InventoryMovement[]> {
    try {
      const whereConstraints = [where('movementType', '==', movementType)];
      
      if (startDate) {
        whereConstraints.push(where('performedAt', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        whereConstraints.push(where('performedAt', '<=', Timestamp.fromDate(endDate)));
      }
      
      const allConstraints = [
        ...whereConstraints,
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      ];

      const q = query(collection(db, COLLECTION_NAME), ...allConstraints);
      const querySnapshot = await getDocs(q);

      const movements = querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          performedAt: (data.performedAt as Timestamp)?.toDate() || new Date(),
        } as InventoryMovement;
      });

      return movements;

    } catch (error) {
      logger.error('Error getting movements by type:', error as Error);
      throw new Error('Error al obtener movimientos por tipo');
    }
  }

  /**
   * Bulk stock adjustment (for inventory audits)
   */
  static async bulkStockAdjustment(
    adjustments: Array<{
      itemId: string;
      itemType: 'raw-material' | 'finished-product';
      newStock: number;
      reason: string;
    }>,
    performedBy: string
  ): Promise<InventoryMovement[]> {
    const batch = writeBatch(db);
    const movements: InventoryMovement[] = [];

    try {
      for (const adjustment of adjustments) {
        // Get current item
        let currentItem: RawMaterial | FinishedProduct | null = null;
        
        if (adjustment.itemType === 'raw-material') {
          currentItem = await RawMaterialsService.getRawMaterialById(adjustment.itemId);
        } else {
          currentItem = await FinishedProductsService.getFinishedProductById(adjustment.itemId);
        }

        if (!currentItem) {
          logger.warn(`Item not found for adjustment: ${adjustment.itemId}`);
          continue;
        }

        const now = new Date();
        const unitCost = adjustment.itemType === 'raw-material' ? 
          (currentItem as RawMaterial).unitCost : 
          (currentItem as FinishedProduct).totalCost;

        // Create movement record
        const movementData = {
          itemId: adjustment.itemId,
          itemType: adjustment.itemType,
          itemName: currentItem.name,
          itemSku: currentItem.sku,
          movementType: 'Ajuste' as const,
          quantity: adjustment.newStock,
          unitCost,
          totalCost: adjustment.newStock * unitCost,
          previousStock: currentItem.currentStock,
          newStock: adjustment.newStock,
          reason: adjustment.reason,
          referenceDocument: undefined,
          referenceId: undefined,
          location: currentItem.location,
          performedBy,
          performedAt: Timestamp.fromDate(now),
          notes: `Ajuste de inventario: ${currentItem.currentStock} → ${adjustment.newStock}`,
        };

        // Add movement document
        const movementRef = await addDoc(collection(db, COLLECTION_NAME), movementData);

        // Update item stock
        const collectionName = adjustment.itemType === 'raw-material' ? 'raw-materials' : 'finished-products';
        const itemRef = doc(db, collectionName, adjustment.itemId);
        batch.update(itemRef, {
          currentStock: adjustment.newStock,
          lastMovementDate: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
          updatedBy: performedBy
        });

        movements.push({
          id: movementRef.id,
          ...movementData,
          performedAt: now,
        });
      }

      // Commit all changes
      await batch.commit();

      logger.info(`Bulk stock adjustment completed: ${adjustments.length} items adjusted`);
      return movements;

    } catch (error) {
      logger.error('Error in bulk stock adjustment:', error as Error);
      throw new Error('Error en ajuste masivo de inventario');
    }
  }
}