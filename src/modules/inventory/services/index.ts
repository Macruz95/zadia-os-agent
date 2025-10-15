/**
 * ZADIA OS - Inventory Services Exports
 * 
 * Entity-specific services for inventory management
 */

export * from './entities/raw-materials-entity.service';
export * from './entities/finished-products-entity.service';
export * from './entities/inventory-movements-entity.service';
export * from './entities/inventory-alerts.service';
export * from './entities/inventory-kpis.service';
export * from './entities/bom.service';

// Re-export commonly used services for convenience
export { RawMaterialsService, FinishedProductsService } from './inventory.service';