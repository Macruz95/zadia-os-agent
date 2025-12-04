/**
 * ZADIA OS - Finished Products Creation Service
 * 
 * Handles creation of finished products
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { FinishedProduct, FinishedProductFormData } from '../../types';

const COLLECTION_NAME = 'finished-products';

export class FinishedProductCreationService {
  /**
   * Generate unique SKU for finished product
   */
  private static generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `FP-${categoryCode}-${nameCode}-${timestamp}`;
  }

  /**
   * Create a new finished product
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createFinishedProduct(
    data: FinishedProductFormData,
    createdBy: string,
    tenantId?: string
  ): Promise<FinishedProduct> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const sku = this.generateSKU(data.category, data.name);
      const now = new Date();

      // Calculate total cost
      const totalCost = (data.laborCost || 0) + (data.overheadCost || 0);

      const finishedProductData: Record<string, unknown> = {
        sku,
        tenantId, // CRITICAL: Add tenant isolation
        name: data.name,
        category: data.category,
        currentStock: 0, // Always start with 0 stock
        minimumStock: data.minimumStock,
        unitCost: 0, // Will be calculated when BOM is added
        laborCost: data.laborCost || 0,
        overheadCost: data.overheadCost || 0,
        totalCost,
        suggestedPrice: data.suggestedPrice,
        sellingPrice: data.sellingPrice,
        status: 'Disponible' as const,
        location: data.location,
        images: [],
        isActive: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy
      };

      // Only add optional fields if they exist and are not empty
      if (data.description && data.description.trim() !== '') {
        finishedProductData.description = data.description.trim();
      }
      if (data.dimensions) {
        finishedProductData.dimensions = data.dimensions;
      }
      if (data.specifications && data.specifications.trim() !== '') {
        finishedProductData.specifications = data.specifications.trim();
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), finishedProductData);
      
      const newFinishedProduct = {
        id: docRef.id,
        ...finishedProductData,
        createdAt: now,
        updatedAt: now
      } as FinishedProduct;

      logger.info(`Finished product created: ${newFinishedProduct.name} (${newFinishedProduct.sku})`);
      return newFinishedProduct;

    } catch (error) {
      logger.error('Error creating finished product:', error as Error);
      throw new Error('Error al crear producto terminado');
    }
  }
}