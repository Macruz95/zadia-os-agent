/**
 * ZADIA OS - Raw Materials Creation Service
 * 
 * Handles creation of raw materials
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { RawMaterial, RawMaterialFormData } from '../../types';

const COLLECTION_NAME = 'raw-materials';

export class RawMaterialCreationService {
  /**
   * Generate unique SKU for raw material
   */
  private static generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `RM-${categoryCode}-${nameCode}-${timestamp}`;
  }

  /**
   * Create a new raw material
   */
  static async createRawMaterial(
    data: RawMaterialFormData,
    createdBy: string
  ): Promise<RawMaterial> {
    try {
      const sku = this.generateSKU(data.category, data.name);
      const now = new Date();

      const rawMaterialData: Record<string, unknown> = {
        sku,
        name: data.name,
        category: data.category,
        unitOfMeasure: data.unitOfMeasure,
        currentStock: 0, // Always start with 0 stock
        minimumStock: data.minimumStock,
        unitCost: data.unitCost,
        averageCost: data.unitCost,
        location: data.location,
        isActive: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy
      };

      // Only add optional fields if they exist and are not empty
      if (data.supplierId && data.supplierId.trim() !== '') {
        rawMaterialData.supplierId = data.supplierId.trim();
      }
      if (data.supplierName && data.supplierName.trim() !== '') {
        rawMaterialData.supplierName = data.supplierName.trim();
      }
      if (data.description && data.description.trim() !== '') {
        rawMaterialData.description = data.description.trim();
      }
      if (data.specifications && data.specifications.trim() !== '') {
        rawMaterialData.specifications = data.specifications.trim();
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), rawMaterialData);
      
      const newRawMaterial = {
        id: docRef.id,
        ...rawMaterialData,
        createdAt: now,
        updatedAt: now
      } as RawMaterial;

      logger.info(`Raw material created: ${newRawMaterial.name} (${newRawMaterial.sku})`);
      return newRawMaterial;

    } catch (error) {
      logger.error('Error creating raw material:', error as Error);
      throw new Error('Error al crear materia prima');
    }
  }
}