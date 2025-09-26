// Import required types from base inventory types
import {
  RawMaterial,
  FinishedProduct,
  RawMaterialCategory,
  FinishedProductCategory,
  UnitOfMeasure,
  ProductStatus,
  MovementType,
  BOMItem,
  BillOfMaterials,
  InventoryMovement,
  Dimensions,
  InventoryLocation
} from './inventory.types';

// Additional Inventory Types
export interface InventoryAlert {
  id: string;
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  itemName: string;
  itemSku: string;
  alertType: 'low-stock' | 'out-of-stock' | 'expired';
  currentStock: number;
  minimumStock: number;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  readBy?: string;
}

export interface InventoryAudit {
  id: string;
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  itemName: string;
  action: 'create' | 'update' | 'delete' | 'stock-adjustment';
  changes: Record<string, { oldValue: unknown; newValue: unknown }>;
  performedBy: string;
  performedAt: Date;
  ipAddress?: string;
  reason?: string;
}

// Filter and Search Types
export interface InventoryFilters {
  category?: string;
  status?: ProductStatus;
  location?: string;
  supplier?: string;
  lowStock?: boolean;
  itemType?: 'raw-material' | 'finished-product';
}

export interface InventorySearchParams {
  query?: string;
  filters?: InventoryFilters;
  sortBy?: 'name' | 'sku' | 'currentStock' | 'unitCost' | 'lastMovementDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Form Types
export interface RawMaterialFormData {
  name: string;
  category: RawMaterialCategory;
  unitOfMeasure: UnitOfMeasure;
  minimumStock: number;
  unitCost: number;
  location: InventoryLocation;
  supplierId?: string;
  supplierName?: string;
  description?: string;
  specifications?: string;
}

export interface FinishedProductFormData {
  name: string;
  category: FinishedProductCategory;
  description?: string;
  dimensions?: Dimensions;
  minimumStock: number;
  laborCost: number;
  overheadCost: number;
  suggestedPrice: number;
  sellingPrice: number;
  location: InventoryLocation;
  specifications?: string;
  billOfMaterials?: Omit<BOMItem, 'totalCost'>[];
}

export interface MovementFormData {
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceDocument?: string;
  notes?: string;
}

// UI State Types
export interface InventoryDirectoryState {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  loading: boolean;
  error?: string;
  searchParams: InventorySearchParams;
  totalCount: number;
  activeTab: 'raw-materials' | 'finished-products';
}

export interface InventoryItemState {
  item?: RawMaterial | FinishedProduct;
  movements: InventoryMovement[];
  billOfMaterials?: BillOfMaterials;
  alerts: InventoryAlert[];
  loading: boolean;
  error?: string;
}

// Dashboard Types
export interface InventoryKPIs {
  totalRawMaterials: number;
  totalFinishedProducts: number;
  lowStockItems: number;
  totalInventoryValue: number;
  topMovingItems: Array<{
    itemId: string;
    itemName: string;
    itemType: 'raw-material' | 'finished-product';
    movementCount: number;
  }>;
  recentMovements: InventoryMovement[];
}

// Report Types
export interface InventoryValuationReport {
  itemId: string;
  itemName: string;
  itemSku: string;
  itemType: 'raw-material' | 'finished-product';
  currentStock: number;
  unitCost: number;
  totalValue: number;
  lastMovementDate: Date;
}

export interface StockMovementReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  movements: InventoryMovement[];
  totalEntries: number;
  totalExits: number;
  netMovement: number;
  totalValue: number;
}