/**
 * ZADIA OS - Inventory Movements Entity Service (Refactored)
 * 
 * Handles all Firebase operations for inventory movements
 * Manages stock changes, auditing, and movement history
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { InventoryMovement, MovementFormData } from '../../types';
import { RawMaterialsService } from './raw-materials-entity.service';
import { FinishedProductsService } from './finished-products-entity.service';
import { MovementDataProcessor } from '../utils/movement-processor.service';

const COLLECTION_NAME = 'inventory-movements';

export class InventoryMovementsService {
  /**
   * Create a new inventory movement and update stock
   */
  static async createMovement(
    data: MovementFormData
  ): Promise<InventoryMovement> {
    try {
      // Get current item to calculate new stock
      const currentItem = data.itemType === 'raw-material'
        ? await RawMaterialsService.getRawMaterialById(data.itemId)
        : await FinishedProductsService.getFinishedProductById(data.itemId);

      if (!currentItem) {
        throw new Error('Ítem no encontrado');
      }

      // Process movement data
      const processedMovement = MovementDataProcessor.processMovementData(
        data,
        currentItem,
        data.performedBy
      );

      // Create movement document
      const movementRef = await addDoc(
        collection(db, COLLECTION_NAME),
        MovementDataProcessor.toFirestoreFormat(processedMovement)
      );

      // Update item stock
      if (data.itemType === 'raw-material') {
        await RawMaterialsService.updateStock(data.itemId, processedMovement.newStock);
      } else {
        await FinishedProductsService.updateStock(data.itemId, processedMovement.newStock);
      }

      // Log the operation
      logger.info('Inventory movement created');

      return {
        id: movementRef.id,
        ...processedMovement
      };
    } catch (error) {
      logger.error('Error creating inventory movement');
      throw error;
    }
  }

  /**
   * Get movements by item ID
   */
  static async getMovementsByItem(
    itemId: string,
    itemType?: 'raw-material' | 'finished-product',
    limitCount: number = 50
  ): Promise<InventoryMovement[]> {
    try {
      // Simple query without ordering to avoid index issues initially
      const simpleQuery = query(
        collection(db, COLLECTION_NAME),
        where('itemId', '==', itemId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(simpleQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const movements = querySnapshot.docs.map(doc => 
        MovementDataProcessor.fromFirestoreFormat(doc)
      );
      
      // Sort by date in memory since we removed orderBy from query
      movements.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
      
      return movements;
    } catch (error) {
      logger.error('Error fetching movements by item', error as Error);
      // If it's a "not found" or "permission denied" error, return empty array
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Missing or insufficient permissions'))) {
        logger.warn('No movements collection found or no permissions', {
          component: 'InventoryMovements',
          action: 'getMovementsByItem'
        });
        return [];
      }
      throw new Error('Error al obtener historial de movimientos');
    }
  }

  /**
   * Get recent movements across all items
   */
  static async getRecentMovements(limitCount: number = 50): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(MovementDataProcessor.fromFirestoreFormat);
    } catch (error) {
      logger.error('Error fetching recent movements', error as Error);
      throw new Error('Error al obtener movimientos recientes');
    }
  }

  /**
   * Get movements by type
   */
  static async getMovementsByType(
    movementType: MovementFormData['movementType'],
    limitCount: number = 50
  ): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('movementType', '==', movementType),
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(MovementDataProcessor.fromFirestoreFormat);
    } catch (error) {
      logger.error('Error fetching movements by type', error as Error);
      throw new Error('Error al obtener movimientos por tipo');
    }
  }

  /**
   * Get movements for date range
   */
  static async getMovementsByDateRange(
    startDate: Date,
    endDate: Date,
    limitCount: number = 100
  ): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('performedAt', '>=', startDate),
        where('performedAt', '<=', endDate),
        orderBy('performedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(MovementDataProcessor.fromFirestoreFormat);
    } catch (error) {
      logger.error('Error fetching movements by date range', error as Error);
      throw new Error('Error al obtener movimientos por rango de fechas');
    }
  }
}