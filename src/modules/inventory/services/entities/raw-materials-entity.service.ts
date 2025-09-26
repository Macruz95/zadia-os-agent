/**
 * ZADIA OS - Raw Materials Entity Service
 * 
 * Handles all Firebase operations for raw materials
 * Following SOLID principles and clean architecture patterns
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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  RawMaterial, 
  RawMaterialFormData,
  InventorySearchParams
} from '../../types';

const COLLECTION_NAME = 'raw-materials';

export class RawMaterialsService {
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

      const rawMaterialData = {
        sku,
        name: data.name,
        category: data.category,
        unitOfMeasure: data.unitOfMeasure,
        currentStock: 0, // Always start with 0 stock
        minimumStock: data.minimumStock,
        unitCost: data.unitCost,
        averageCost: data.unitCost,
        location: data.location,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        description: data.description,
        specifications: data.specifications,
        lastPurchaseDate: undefined,
        lastMovementDate: undefined,
        isActive: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), rawMaterialData);
      
      const newRawMaterial: RawMaterial = {
        id: docRef.id,
        ...rawMaterialData,
        createdAt: now,
        updatedAt: now
      };

      logger.info(`Raw material created: ${newRawMaterial.name} (${newRawMaterial.sku})`);
      return newRawMaterial;

    } catch (error) {
      logger.error('Error creating raw material:', error as Error);
      throw new Error('Error al crear materia prima');
    }
  }

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
   * Get all raw materials with search and filtering
   */
  static async searchRawMaterials(
    searchParams: InventorySearchParams = {}
  ): Promise<{ rawMaterials: RawMaterial[]; totalCount: number }> {
    try {
      const constraints = [];

      // Apply filters
      if (searchParams.filters?.category) {
        constraints.push(where('category', '==', searchParams.filters.category));
      }

      if (searchParams.filters?.supplier) {
        constraints.push(where('supplierId', '==', searchParams.filters.supplier));
      }

      if (searchParams.filters?.lowStock) {
        // This would need to be handled at application level due to Firestore limitations
        // We'll filter after fetching data
      }

      // Apply sorting
      const sortField = searchParams.sortBy || 'name';
      const sortDirection = searchParams.sortOrder || 'asc';
      constraints.push(orderBy(sortField, sortDirection));

      // Apply pagination
      const pageSize = searchParams.pageSize || 50;
      constraints.push(limit(pageSize));

      const q = constraints.length > 0 
        ? query(collection(db, COLLECTION_NAME), ...constraints)
        : collection(db, COLLECTION_NAME);

      const querySnapshot = await getDocs(q);
      let rawMaterials: RawMaterial[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          lastPurchaseDate: (data.lastPurchaseDate as Timestamp)?.toDate() || null,
          lastMovementDate: (data.lastMovementDate as Timestamp)?.toDate() || null,
        } as RawMaterial;
      });

      // Apply client-side filtering for complex queries
      if (searchParams.query) {
        const searchTerm = searchParams.query.toLowerCase();
        rawMaterials = rawMaterials.filter(material =>
          material.name.toLowerCase().includes(searchTerm) ||
          material.sku.toLowerCase().includes(searchTerm) ||
          material.category.toLowerCase().includes(searchTerm)
        );
      }

      if (searchParams.filters?.lowStock) {
        rawMaterials = rawMaterials.filter(material =>
          material.currentStock <= material.minimumStock
        );
      }

      return {
        rawMaterials,
        totalCount: rawMaterials.length
      };

    } catch (error) {
      logger.error('Error searching raw materials:', error as Error);
      throw new Error('Error al buscar materias primas');
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
      const updateData = {
        ...data,
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

  /**
   * Get raw materials with low stock
   */
  static async getLowStockRawMaterials(): Promise<RawMaterial[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), where('isActive', '==', true))
      );

      const rawMaterials = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          lastPurchaseDate: doc.data().lastPurchaseDate?.toDate() || null,
          lastMovementDate: doc.data().lastMovementDate?.toDate() || null,
        } as RawMaterial))
        .filter(material => material.currentStock <= material.minimumStock);

      return rawMaterials;

    } catch (error) {
      logger.error('Error getting low stock raw materials:', error as Error);
      throw new Error('Error al obtener materias primas con stock bajo');
    }
  }
}