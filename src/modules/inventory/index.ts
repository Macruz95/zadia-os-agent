// Types
export * from './types';

// Validations
export {
  RawMaterialSchema,
  FinishedProductSchema,
  BOMItemSchema,
  BillOfMaterialsSchema,
  MovementSchema,
  InventoryFiltersSchema,
  InventorySearchParamsSchema,
  InventoryLocationSchema,
  DimensionsSchema,
} from './validations/inventory.schema';

// Services
export * from './services/inventory.service';

// Hooks
export * from './hooks/use-inventory';
export * from './hooks/use-raw-material-form';
export * from './hooks/use-finished-product-form';
export * from './hooks/use-inventory-alerts';
export * from './hooks/use-inventory-kpis';
export * from './hooks/use-bom';

// Components
export { InventoryDirectory } from './components/InventoryDirectory';
export { InventoryTable } from './components/InventoryTable';
export { StockAlertsCard } from './components/alerts/StockAlertsCard';
export { InventoryKPIsCard } from './components/dashboard/InventoryKPIsCard';
export { BOMBuilder } from './components/bom/BOMBuilder';