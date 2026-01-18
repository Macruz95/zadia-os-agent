/**
 * ZADIA OS - Raw Materials Search Service
 * 
 * Handles search and filtering of raw materials
 */

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { RawMaterial, InventorySearchParams } from '../../types';

const COLLECTION_NAME = 'raw-materials';

export class RawMaterialSearchService {
  /**
   * Get all raw materials with search and filtering
   */
  static async searchRawMaterials(
    searchParams: InventorySearchParams = {}
  ): Promise<{ rawMaterials: RawMaterial[]; totalCount: number }> {
    try {
      // CRITICAL: tenantId is REQUIRED for Firestore security rules
      if (!searchParams.tenantId) {
        logger.warn('searchRawMaterials called without tenantId - returning empty results');
        return { rawMaterials: [], totalCount: 0 };
      }

      const constraints = [];

      // CRITICAL: Always filter by tenantId for data isolation
      constraints.push(where('tenantId', '==', searchParams.tenantId));

      // Apply filters
      if (searchParams.filters?.category) {
        constraints.push(where('category', '==', searchParams.filters.category));
      }

      if (searchParams.filters?.supplier) {
        constraints.push(where('supplierId', '==', searchParams.filters.supplier));
      }

      // NOTE: We do NOT add orderBy here to avoid requiring composite indexes
      // Sorting is done client-side after fetching the data

      // Apply pagination
      const pageSize = searchParams.pageSize || 50;
      constraints.push(limit(pageSize));

      const q = constraints.length > 0 
        ? query(collection(db, COLLECTION_NAME), ...constraints)
        : query(collection(db, COLLECTION_NAME), limit(pageSize));

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

      // Client-side sorting (always, since we don't use server-side orderBy)
      const sortField = (searchParams.sortBy || 'name') as keyof RawMaterial;
      const sortDirection = searchParams.sortOrder || 'asc';
      rawMaterials.sort((a, b) => {
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
   * Get raw materials with low stock
   */
  static async getLowStockRawMaterials(tenantId?: string): Promise<RawMaterial[]> {
    try {
      const constraints = [where('isActive', '==', true)];
      
      // CRITICAL: Filter by tenantId for data isolation
      if (tenantId) {
        constraints.push(where('tenantId', '==', tenantId));
      }
      
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), ...constraints)
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