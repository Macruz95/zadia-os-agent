// Import required types from base inventory types
import {
  RawMaterial,
  FinishedProduct,
  ProductStatus,
  MovementType,
  BillOfMaterials,
  InventoryMovement
} from './inventory.types';

// Additional Inventory Types
export interface InventoryAlert {
  id: string;
  tenantId: string;
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

// Purchase History Types
export interface PurchaseHistory {
  id: string;
  tenantId: string;

  // Material comprado
  rawMaterialId: string;
  rawMaterialName: string;
  rawMaterialSku: string;

  // Proveedor
  supplier: string;

  // Detalles de compra
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number;

  // Fechas y documentación
  purchaseDate: Date;
  invoiceNumber?: string;
  referenceDocument?: string;

  // Tracking
  createdBy: string;
  createdAt: Date;
  notes?: string;
}

// Price Analysis Types
export interface SupplierPriceAnalysis {
  supplier: string;
  purchaseCount: number;
  averagePrice: number;
  lastPrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceVariation: number;
  lastPurchaseDate: Date;
  totalQuantityBought: number;
}

export interface PriceAlert {
  type: 'increase' | 'decrease';
  currentPrice: number;
  previousPrice: number;
  percentageChange: number;
  supplier: string;
  purchaseDate: Date;
  message: string;
}

export interface SupplierComparison {
  rank: number;
  supplier: string;
  averagePrice: number;
  lastPrice: number;
  purchaseCount: number;
  recommendation: 'best_price' | 'frequent' | 'recent' | 'expensive';
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
  tenantId?: string;
  query?: string;
  filters?: InventoryFilters;
  sortBy?: 'name' | 'sku' | 'currentStock' | 'unitCost' | 'lastMovementDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Form Types - RawMaterialFormData and FinishedProductFormData are now defined in inventory.types.ts to avoid duplication

export interface MovementFormData {
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  reason?: string;
  referenceDocument?: string;
  notes?: string;
  performedBy: string;
  performedAt?: Date;
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