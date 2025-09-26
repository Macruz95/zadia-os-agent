/**
 * ZADIA OS - Raw Materials Entity Service
 * 
 * Main service orchestrating all raw materials operations
 */

import { RawMaterial, RawMaterialFormData, InventorySearchParams } from '../../types';
import { RawMaterialCreationService } from './raw-material-creation.service';
import { RawMaterialSearchService } from './raw-material-search.service';
import { RawMaterialCrudService } from './raw-material-crud.service';

export class RawMaterialsService {
  /**
   * Create a new raw material
   */
  static async createRawMaterial(
    data: RawMaterialFormData,
    createdBy: string
  ): Promise<RawMaterial> {
    return RawMaterialCreationService.createRawMaterial(data, createdBy);
  }

  /**
   * Get raw material by ID
   */
  static async getRawMaterialById(id: string): Promise<RawMaterial | null> {
    return RawMaterialCrudService.getRawMaterialById(id);
  }

  /**
   * Get all raw materials with search and filtering
   */
  static async searchRawMaterials(
    searchParams: InventorySearchParams = {}
  ): Promise<{ rawMaterials: RawMaterial[]; totalCount: number }> {
    return RawMaterialSearchService.searchRawMaterials(searchParams);
  }

  /**
   * Update raw material
   */
  static async updateRawMaterial(
    id: string,
    data: Partial<RawMaterialFormData>,
    updatedBy: string
  ): Promise<RawMaterial> {
    return RawMaterialCrudService.updateRawMaterial(id, data, updatedBy);
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
    return RawMaterialCrudService.updateStock(id, newStock, newAverageCost, updatedBy);
  }

  /**
   * Soft delete raw material (mark as inactive)
   */
  static async deleteRawMaterial(id: string, deletedBy: string): Promise<void> {
    return RawMaterialCrudService.deleteRawMaterial(id, deletedBy);
  }

  /**
   * Get raw materials with low stock
   */
  static async getLowStockRawMaterials(): Promise<RawMaterial[]> {
    return RawMaterialSearchService.getLowStockRawMaterials();
  }
}