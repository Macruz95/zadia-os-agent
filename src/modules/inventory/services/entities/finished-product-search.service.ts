/**
 * ZADIA OS - Finished Products Search Service
 * 
 * Handles search and filtering of finished products
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { FinishedProduct, InventorySearchParams } from '../../types';

const COLLECTION_NAME = 'finished-products';

export class FinishedProductSearchService {
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

      // Only add orderBy if we have other constraints (to avoid index requirement)
      if (constraints.length > 0) {
        const sortField = searchParams.sortBy || 'name';
        const sortDirection = searchParams.sortOrder || 'asc';
        constraints.push(orderBy(sortField, sortDirection));
      }

      // Apply pagination
      const pageSize = searchParams.pageSize || 50;
      if (constraints.length > 0) {
        constraints.push(limit(pageSize));
      }

      const q = constraints.length > 0 
        ? query(collection(db, COLLECTION_NAME), ...constraints)
        : query(collection(db, COLLECTION_NAME), limit(pageSize));

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

      // Client-side sorting if no server-side orderBy was applied
      if (constraints.length === 0 || !searchParams.sortBy) {
        const sortField = (searchParams.sortBy || 'name') as keyof FinishedProduct;
        const sortDirection = searchParams.sortOrder || 'asc';
        finishedProducts.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc' 
              ? aVal.localeCompare(bVal) 
              : bVal.localeCompare(aVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
          return 0;
        });
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