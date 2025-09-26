/**
 * ZADIA OS - Finished Products CRUD Service
 * 
 * Handles basic CRUD operations for finished products
 */

import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { FinishedProduct, FinishedProductFormData } from '../../types';

const COLLECTION_NAME = 'finished-products';

export class FinishedProductCrudService {
  /**
   * Get finished product by ID
   */
  static async getFinishedProductById(id: string): Promise<FinishedProduct | null> {
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
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastProductionDate: data.lastProductionDate?.toDate() || null,
        lastSaleDate: data.lastSaleDate?.toDate() || null,
      } as FinishedProduct;

    } catch (error) {
      logger.error('Error getting finished product:', error as Error);
      throw new Error('Error al obtener producto terminado');
    }
  }

  /**
   * Update finished product
   */
  static async updateFinishedProduct(
    id: string,
    data: Partial<FinishedProductFormData>,
    updatedBy: string
  ): Promise<FinishedProduct> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Recalculate total cost if costs are updated
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy
      };

      if (data.laborCost !== undefined || data.overheadCost !== undefined) {
        const current = await this.getFinishedProductById(id);
        if (current) {
          const laborCost = data.laborCost !== undefined ? data.laborCost : current.laborCost;
          const overheadCost = data.overheadCost !== undefined ? data.overheadCost : current.overheadCost;
          updateData.totalCost = current.unitCost + laborCost + overheadCost;
        }
      }

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getFinishedProductById(id);
      if (!updatedDoc) {
        throw new Error('Producto terminado no encontrado después de actualizar');
      }

      logger.info(`Finished product updated: ${updatedDoc.name} (${updatedDoc.sku})`);
      return updatedDoc;

    } catch (error) {
      logger.error('Error updating finished product:', error as Error);
      throw new Error('Error al actualizar producto terminado');
    }
  }

  /**
   * Update stock level (for inventory movements)
   */
  static async updateStock(
    id: string,
    newStock: number,
    updatedBy?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = {
        currentStock: newStock,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }

      await updateDoc(docRef, updateData);
      logger.info(`Finished product stock updated: ID ${id}, new stock: ${newStock}`);

    } catch (error) {
      logger.error('Error updating finished product stock:', error as Error);
      throw new Error('Error al actualizar stock de producto terminado');
    }
  }

  /**
   * Update unit cost (when BOM changes)
   */
  static async updateUnitCost(
    id: string,
    newUnitCost: number,
    updatedBy?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const current = await this.getFinishedProductById(id);
      
      if (!current) {
        throw new Error('Producto terminado no encontrado');
      }

      const newTotalCost = newUnitCost + current.laborCost + current.overheadCost;

      const updateData: Record<string, unknown> = {
        unitCost: newUnitCost,
        totalCost: newTotalCost,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }

      await updateDoc(docRef, updateData);
      logger.info(`Finished product unit cost updated: ID ${id}, new cost: ${newUnitCost}`);

    } catch (error) {
      logger.error('Error updating finished product unit cost:', error as Error);
      throw new Error('Error al actualizar costo unitario de producto terminado');
    }
  }

  /**
   * Soft delete finished product (mark as inactive)
   */
  static async deleteFinishedProduct(id: string, deletedBy: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: deletedBy
      });

      logger.info(`Finished product soft deleted: ID ${id}`);

    } catch (error) {
      logger.error('Error deleting finished product:', error as Error);
      throw new Error('Error al eliminar producto terminado');
    }
  }
}