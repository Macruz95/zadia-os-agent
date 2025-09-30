# 📦 ZADIA OS - Inventory Module API Reference

## Hooks API

### useRawMaterials()

Maneja el estado y operaciones de materias primas.

**Returns:** `UseRawMaterialsReturn`

```typescript
interface UseRawMaterialsReturn {
  rawMaterials: RawMaterial[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchRawMaterials: () => Promise<void>;
  createRawMaterial: (data: any) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, data: any) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  getLowStockMaterials: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

**Example:**
```typescript
const {
  rawMaterials,
  loading,
  error,
  searchRawMaterials,
  createRawMaterial
} = useRawMaterials();

// Load materials
useMemo(() => {
  searchRawMaterials();
}, []);

// Create new material
const handleCreate = async (data) => {
  try {
    const newMaterial = await createRawMaterial(data);
    console.log('Created:', newMaterial);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### useFinishedProducts()

Maneja el estado y operaciones de productos terminados.

**Returns:** `UseFinishedProductsReturn`

```typescript
interface UseFinishedProductsReturn {
  finishedProducts: FinishedProduct[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchFinishedProducts: () => Promise<void>;
  createFinishedProduct: (data: any) => Promise<FinishedProduct>;
  updateFinishedProduct: (id: string, data: any) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  updateUnitCost: (id: string, newCost: number) => Promise<void>;
  deleteFinishedProduct: (id: string) => Promise<void>;
  getLowStockProducts: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

**Example:**
```typescript
const {
  finishedProducts,
  updateStock,
  updateUnitCost
} = useFinishedProducts();

// Update stock
const handleStockUpdate = async (productId, newStock) => {
  await updateStock(productId, newStock);
};

// Update cost
const handleCostUpdate = async (productId, newCost) => {
  await updateUnitCost(productId, newCost);
};
```

---

### useInventoryMovements()

Maneja el estado y operaciones de movimientos de inventario.

**Returns:** `UseInventoryMovementsReturn`

```typescript
interface UseInventoryMovementsReturn {
  movements: InventoryMovement[];
  loading: boolean;
  error?: string;
  totalCount: number;
  getMovementsByItem: (itemId: string, itemType: 'raw-material' | 'finished-product') => Promise<void>;
  getRecentMovements: (limit?: number) => Promise<void>;
  createMovement: (data: any) => Promise<InventoryMovement>;
  refresh: () => Promise<void>;
}
```

**Example:**
```typescript
const {
  movements,
  getMovementsByItem,
  createMovement
} = useInventoryMovements();

// Get movements for specific item
const loadItemMovements = async (itemId) => {
  await getMovementsByItem(itemId, 'raw-material');
};

// Create new movement
const handleNewMovement = async () => {
  await createMovement({
    itemId: 'material-123',
    itemType: 'raw-material',
    movementType: 'Entrada',
    quantity: 100,
    reason: 'Compra'
  });
};
```

---

## Service Methods API

### RawMaterialsService

#### `createRawMaterial(data: RawMaterialFormData, createdBy: string): Promise<RawMaterial>`

Crea una nueva materia prima.

**Parameters:**
- `data`: Datos de la materia prima
- `createdBy`: ID del usuario que crea

**Returns:** Promise con la materia prima creada

**Example:**
```typescript
const newMaterial = await RawMaterialsService.createRawMaterial({
  name: 'Madera de Roble',
  category: 'Maderas',
  unitOfMeasure: 'm3',
  unitCost: 2500,
  currentStock: 50,
  minimumStock: 10
}, 'user-123');
```

#### `searchRawMaterials(params?: InventorySearchParams): Promise<{rawMaterials: RawMaterial[], totalCount: number}>`

Busca materias primas con filtros opcionales.

**Parameters:**
- `params`: Parámetros de búsqueda (opcional)

**Returns:** Promise con array de materias primas y total

**Example:**
```typescript
const result = await RawMaterialsService.searchRawMaterials({
  category: 'Maderas',
  minStock: 5
});
console.log(`Found ${result.totalCount} materials`);
```

#### `updateStock(id: string, newStock: number, avgCost?: number, updatedBy?: string): Promise<void>`

Actualiza el stock de una materia prima.

**Parameters:**
- `id`: ID de la materia prima
- `newStock`: Nuevo stock
- `avgCost`: Nuevo costo promedio (opcional)
- `updatedBy`: ID del usuario (opcional)

#### `getLowStockRawMaterials(): Promise<RawMaterial[]>`

Obtiene materias primas con stock bajo.

**Returns:** Array de materias primas con stock bajo

---

### FinishedProductsService

#### `createFinishedProduct(data: FinishedProductFormData, createdBy: string): Promise<FinishedProduct>`

Crea un nuevo producto terminado.

**Example:**
```typescript
const newProduct = await FinishedProductsService.createFinishedProduct({
  name: 'Mesa de Comedor Clásica',
  category: 'Comedor',
  unitOfMeasure: 'unidades',
  unitCost: 850,
  sellingPrice: 1200,
  currentStock: 5,
  minimumStock: 2
}, 'user-123');
```

#### `updateUnitCost(id: string, newCost: number, updatedBy?: string): Promise<void>`

Actualiza el costo unitario de un producto.

**Parameters:**
- `id`: ID del producto
- `newCost`: Nuevo costo unitario
- `updatedBy`: ID del usuario (opcional)

---

### InventoryMovementsService

#### `createMovement(data: InventoryMovementData): Promise<InventoryMovement>`

Crea un nuevo movimiento de inventario.

**Parameters:**
- `data`: Datos del movimiento

**Example:**
```typescript
const movement = await InventoryMovementsService.createMovement({
  itemId: 'material-123',
  itemType: 'raw-material',
  movementType: 'Entrada',
  quantity: 25,
  unitCost: 125.50,
  reason: 'Compra a proveedor XYZ',
  reference: 'PO-2024-001'
});
```

#### `getMovementsByItem(itemId: string, itemType: 'raw-material' | 'finished-product'): Promise<InventoryMovement[]>`

Obtiene movimientos de un artículo específico.

#### `getRecentMovements(limit?: number): Promise<InventoryMovement[]>`

Obtiene movimientos recientes.

**Parameters:**
- `limit`: Límite de resultados (default: 50)

---

## Utility Functions API

### inventoryUtils

#### `formatQuantity(quantity: number, unit: UnitOfMeasure): string`

Formatea cantidad con unidad de medida.

**Example:**
```typescript
const formatted = inventoryUtils.formatQuantity(25.5, 'kg');
// Returns: "25.5 kg"
```

#### `formatUnitCost(cost: number, currency?: string): string`

Formatea costo con moneda.

**Example:**
```typescript
const formatted = inventoryUtils.formatUnitCost(125.50);
// Returns: "Q125.50"
```

#### `calculateTotalValue(quantity: number, unitCost: number): number`

Calcula valor total.

#### `getStatusColor(status: ProductStatus): string`

Obtiene color para estado de producto.

#### `getMovementTypeColor(type: MovementType): string`

Obtiene color para tipo de movimiento.

#### `isLowStock(currentStock: number, minStock: number): boolean`

Verifica si el stock está bajo.

#### `generateSKU(category: string, name: string): string`

Genera SKU automático.

**Example:**
```typescript
const sku = inventoryUtils.generateSKU('Maderas', 'Roble Europeo');
// Returns: "MAD-ROBLEEU-1234"
```

---

### stockCalculations

#### `calculateReorderPoint(averageDemand: number, leadTimeDays: number, safetyStock: number): number`

Calcula punto de reorden.

**Example:**
```typescript
const reorderPoint = stockCalculations.calculateReorderPoint(10, 5, 15);
// Returns: 65 (10 * 5 + 15)
```

#### `calculateEOQ(annualDemand: number, orderingCost: number, holdingCost: number): number`

Calcula cantidad económica de pedido.

#### `calculateTurnoverRatio(costOfGoodsSold: number, averageInventoryValue: number): number`

Calcula ratio de rotación de inventario.

---

## Component Props API

### InventoryForm

```typescript
interface InventoryFormProps {
  type: 'raw-material' | 'finished-product';
  initialData?: Partial<RawMaterialFormData | FinishedProductFormData>;
  onSubmit: (data: RawMaterialFormData | FinishedProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
<InventoryForm
  type="raw-material"
  onSubmit={handleSubmit}
  onCancel={() => setIsOpen(false)}
  isLoading={loading}
/>
```

---

## Type Definitions

### Core Enums

```typescript
type RawMaterialCategory = 
  | 'Maderas'
  | 'Acabados' 
  | 'Adhesivos'
  | 'Herrajes'
  | 'Químicos'
  | 'Textiles'
  | 'Herramientas'
  | 'Otros';

type FinishedProductCategory = 
  | 'Dormitorio'
  | 'Oficina'
  | 'Sala'
  | 'Cocina'
  | 'Comedor'
  | 'Baño'
  | 'Infantil'
  | 'Exterior'
  | 'Otros';

type UnitOfMeasure = 
  | 'unidades' | 'kg' | 'g' | 'lb' | 'oz'
  | 'litros' | 'ml' | 'gal'
  | 'm3' | 'm2' | 'm' | 'cm' | 'mm'
  | 'pies' | 'pulgadas' | 'yardas';

type ProductStatus = 
  | 'Disponible'
  | 'Reservado'
  | 'Vendido'
  | 'FueraDeCatalogo'
  | 'EnProduccion';

type MovementType = 
  | 'Entrada'
  | 'Salida'
  | 'Ajuste'
  | 'Merma'
  | 'Produccion'
  | 'Venta'
  | 'Devolucion';
```

### Core Interfaces

```typescript
interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  category: RawMaterialCategory;
  unitOfMeasure: UnitOfMeasure;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  averageCost: number;
  supplier?: string;
  status: ProductStatus;
  location?: InventoryLocation;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface FinishedProduct {
  id: string;
  sku: string;
  name: string;
  category: FinishedProductCategory;
  unitOfMeasure: UnitOfMeasure;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  sellingPrice: number;
  margin: number;
  status: ProductStatus;
  bomId?: string;
  location?: InventoryLocation;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface InventoryMovement {
  id: string;
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  performedAt: Timestamp;
  performedBy: string;
}
```

## Error Handling

Todos los métodos pueden lanzar las siguientes excepciones:

- `ValidationError`: Error de validación de datos
- `NotFoundError`: Recurso no encontrado
- `PermissionError`: Sin permisos para la operación
- `NetworkError`: Error de conexión
- `ServerError`: Error interno del servidor

**Example:**
```typescript
try {
  await createRawMaterial(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    console.error('Validation failed:', error.details);
  } else if (error instanceof NotFoundError) {
    // Handle not found
    console.error('Resource not found');
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```