/**
 * ZADIA OS - Finished Products Entity Service
 * 
 * Main service orchestrating all finished products operations
 */

import { FinishedProduct, FinishedProductFormData, InventorySearchParams } from '../../types';
import { FinishedProductCreationService } from './finished-product-creation.service';
import { FinishedProductSearchService } from './finished-product-search.service';
import { FinishedProductCrudService } from './finished-product-crud.service';

export class FinishedProductsService {
  /**
   * Create a new finished product
   */
  static async createFinishedProduct(
    data: FinishedProductFormData,
    createdBy: string
  ): Promise<FinishedProduct> {
    return FinishedProductCreationService.createFinishedProduct(data, createdBy);
  }

  /**
   * Get finished product by ID
   */
  static async getFinishedProductById(id: string): Promise<FinishedProduct | null> {
    return FinishedProductCrudService.getFinishedProductById(id);
  }

  /**
   * Get all finished products with search and filtering
   */
  static async searchFinishedProducts(
    searchParams: InventorySearchParams = {}
  ): Promise<{ finishedProducts: FinishedProduct[]; totalCount: number }> {
    return FinishedProductSearchService.searchFinishedProducts(searchParams);
  }

  /**
   * Update finished product
   */
  static async updateFinishedProduct(
    id: string,
    data: Partial<FinishedProductFormData>,
    updatedBy: string
  ): Promise<FinishedProduct> {
    return FinishedProductCrudService.updateFinishedProduct(id, data, updatedBy);
  }

  /**
   * Update stock level (for inventory movements)
   */
  static async updateStock(
    id: string,
    newStock: number,
    updatedBy?: string
  ): Promise<void> {
    return FinishedProductCrudService.updateStock(id, newStock, updatedBy);
  }

  /**
   * Update unit cost (when BOM changes)
   */
  static async updateUnitCost(
    id: string,
    newUnitCost: number,
    updatedBy?: string
  ): Promise<void> {
    return FinishedProductCrudService.updateUnitCost(id, newUnitCost, updatedBy);
  }

  /**
   * Soft delete finished product (mark as inactive)
   */
  static async deleteFinishedProduct(id: string, deletedBy: string): Promise<void> {
    return FinishedProductCrudService.deleteFinishedProduct(id, deletedBy);
  }

  /**
   * Get finished products with low stock
   */
  static async getLowStockFinishedProducts(): Promise<FinishedProduct[]> {
    return FinishedProductSearchService.getLowStockFinishedProducts();
  }
}