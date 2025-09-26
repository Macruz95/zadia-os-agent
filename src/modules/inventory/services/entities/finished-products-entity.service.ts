/**
 * ZADIA OS - Finished Products Entity Service
 * 
 * Handles all Firebase operations for finished products
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
  FinishedProduct, 
  FinishedProductFormData,
  InventorySearchParams
} from '../../types';

const COLLECTION_NAME = 'finished-products';

export class FinishedProductsService {
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
   */
  static async createFinishedProduct(
    data: FinishedProductFormData,
    createdBy: string
  ): Promise<FinishedProduct> {
    try {
      const sku = this.generateSKU(data.category, data.name);
      const now = new Date();

      // Calculate total cost
      const totalCost = (data.laborCost || 0) + (data.overheadCost || 0);

      const finishedProductData = {
        sku,
        name: data.name,
        category: data.category,
        description: data.description,
        dimensions: data.dimensions,
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
        specifications: data.specifications,
        images: [],
        lastProductionDate: undefined,
        lastSaleDate: undefined,
        isActive: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), finishedProductData);
      
      const newFinishedProduct: FinishedProduct = {
        id: docRef.id,
        ...finishedProductData,
        createdAt: now,
        updatedAt: now
      };

      logger.info(`Finished product created: ${newFinishedProduct.name} (${newFinishedProduct.sku})`);
      return newFinishedProduct;

    } catch (error) {
      logger.error('Error creating finished product:', error as Error);
      throw new Error('Error al crear producto terminado');
    }
  }

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
   * Get all finished products with search and filtering
   */
  static async searchFinishedProducts(
    searchParams: InventorySearchParams = {}
  ): Promise<{ finishedProducts: FinishedProduct[]; totalCount: number }> {
    try {
      const constraints = [];

      // Apply filters
      if (searchParams.filters?.category) {
        constraints.push(where('category', '==', searchParams.filters.category));
      }

      if (searchParams.filters?.status) {
        constraints.push(where('status', '==', searchParams.filters.status));
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
      let finishedProducts: FinishedProduct[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          lastProductionDate: (data.lastProductionDate as Timestamp)?.toDate() || null,
          lastSaleDate: (data.lastSaleDate as Timestamp)?.toDate() || null,
        } as FinishedProduct;
      });

      // Apply client-side filtering for complex queries
      if (searchParams.query) {
        const searchTerm = searchParams.query.toLowerCase();
        finishedProducts = finishedProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
        );
      }

      if (searchParams.filters?.lowStock) {
        finishedProducts = finishedProducts.filter(product =>
          product.currentStock <= product.minimumStock
        );
      }

      return {
        finishedProducts,
        totalCount: finishedProducts.length
      };

    } catch (error) {
      logger.error('Error searching finished products:', error as Error);
      throw new Error('Error al buscar productos terminados');
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

  /**
   * Get finished products with low stock
   */
  static async getLowStockFinishedProducts(): Promise<FinishedProduct[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), where('isActive', '==', true))
      );

      const finishedProducts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          lastProductionDate: doc.data().lastProductionDate?.toDate() || null,
          lastSaleDate: doc.data().lastSaleDate?.toDate() || null,
        } as FinishedProduct))
        .filter(product => product.currentStock <= product.minimumStock);

      return finishedProducts;

    } catch (error) {
      logger.error('Error getting low stock finished products:', error as Error);
      throw new Error('Error al obtener productos terminados con stock bajo');
    }
  }
}