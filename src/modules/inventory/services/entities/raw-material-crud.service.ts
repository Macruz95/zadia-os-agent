/**
 * ZADIA OS - Raw Materials CRUD Service
 * 
 * Handles basic CRUD operations for raw materials
 */

import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { RawMaterial, RawMaterialFormData } from '../../types';

const COLLECTION_NAME = 'raw-materials';

export class RawMaterialCrudService {
  /**
   * Get raw material by ID
   */
  static async getRawMaterialById(id: string): Promise<RawMaterial | null> {
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
        lastPurchaseDate: data.lastPurchaseDate?.toDate() || null,
        lastMovementDate: data.lastMovementDate?.toDate() || null,
      } as RawMaterial;

    } catch (error) {
      logger.error('Error getting raw material:', error as Error);
      throw new Error('Error al obtener materia prima');
    }
  }

  /**
   * Update raw material
   */
  static async updateRawMaterial(
    id: string,
    data: Partial<RawMaterialFormData>,
    updatedBy: string
  ): Promise<RawMaterial> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Clean data to avoid undefined values
      const cleanData: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanData[key] = value;
        }
      });

      const updateData = {
        ...cleanData,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy
      };

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getRawMaterialById(id);
      if (!updatedDoc) {
        throw new Error('Materia prima no encontrada después de actualizar');
      }

      logger.info(`Raw material updated: ${updatedDoc.name} (${updatedDoc.sku})`);
      return updatedDoc;

    } catch (error) {
      logger.error('Error updating raw material:', error as Error);
      throw new Error('Error al actualizar materia prima');
    }
  }

  /**
   * Update stock level (for inventory movements)
   */
  static async updateStock(
    id: string,
    newStock: number,
    newAverageCost?: number,
    updatedBy?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = {
        currentStock: newStock,
        lastMovementDate: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (newAverageCost !== undefined) {
        updateData.averageCost = newAverageCost;
      }

      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }

      await updateDoc(docRef, updateData);
      logger.info(`Raw material stock updated: ID ${id}, new stock: ${newStock}`);

    } catch (error) {
      logger.error('Error updating raw material stock:', error as Error);
      throw new Error('Error al actualizar stock de materia prima');
    }
  }

  /**
   * Soft delete raw material (mark as inactive)
   */
  static async deleteRawMaterial(id: string, deletedBy: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: deletedBy
      });

      logger.info(`Raw material soft deleted: ID ${id}`);

    } catch (error) {
      logger.error('Error deleting raw material:', error as Error);
      throw new Error('Error al eliminar materia prima');
    }
  }
}