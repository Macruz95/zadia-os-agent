/**
 * ZADIA OS - Inventory Main Service
 * 
 * Aggregates all inventory-related services
 * Following SOLID principles and clean architecture patterns
 */

// Entity Services
export { RawMaterialsService } from './entities/raw-materials-entity.service';
export { FinishedProductsService } from './entities/finished-products-entity.service';
export { InventoryMovementsService } from './entities/inventory-movements-entity.service';

// Legacy API compatibility layer
import { RawMaterialsService } from './entities/raw-materials-entity.service';
import { FinishedProductsService } from './entities/finished-products-entity.service';
import { InventoryMovementsService } from './entities/inventory-movements-entity.service';

/**
 * Legacy API exports for backward compatibility
 * @deprecated Use specific entity services instead
 */

// Raw Materials
export const createRawMaterial = RawMaterialsService.createRawMaterial;
export const getRawMaterialById = RawMaterialsService.getRawMaterialById;
export const searchRawMaterials = RawMaterialsService.searchRawMaterials;
export const updateRawMaterial = RawMaterialsService.updateRawMaterial;
export const updateRawMaterialStock = RawMaterialsService.updateStock;
export const deleteRawMaterial = RawMaterialsService.deleteRawMaterial;
export const getLowStockRawMaterials = RawMaterialsService.getLowStockRawMaterials;

// Finished Products
export const createFinishedProduct = FinishedProductsService.createFinishedProduct;
export const getFinishedProductById = FinishedProductsService.getFinishedProductById;
export const searchFinishedProducts = FinishedProductsService.searchFinishedProducts;
export const updateFinishedProduct = FinishedProductsService.updateFinishedProduct;
export const updateFinishedProductStock = FinishedProductsService.updateStock;
export const updateFinishedProductUnitCost = FinishedProductsService.updateUnitCost;
export const deleteFinishedProduct = FinishedProductsService.deleteFinishedProduct;
export const getLowStockFinishedProducts = FinishedProductsService.getLowStockFinishedProducts;

// Inventory Movements
export const createMovement = InventoryMovementsService.createMovement;
export const createInventoryMovement = InventoryMovementsService.createMovement;
export const getInventoryMovementById = InventoryMovementsService.getMovementById;
export const getMovementsByItem = InventoryMovementsService.getMovementsByItem;
export const getRecentMovements = InventoryMovementsService.getRecentMovements;
export const getMovementsByType = InventoryMovementsService.getMovementsByType;
export const bulkStockAdjustment = InventoryMovementsService.bulkStockAdjustment;

// Re-export types
export * from '../types';