# 📚 ZADIA OS - Inventory API Reference

## Services

### RawMaterialsService

Servicio principal para gestión de materias primas.

#### Methods

##### `createRawMaterial(data, createdBy)`
Crea una nueva materia prima.

**Parameters:**
- `data: RawMaterialFormData` - Datos de la materia prima
- `createdBy: string` - ID del usuario que crea

**Returns:** `Promise<RawMaterial>`

**Example:**
```typescript
const material = await RawMaterialsService.createRawMaterial({
  name: 'Madera Pino',
  category: 'Maderas',
  unitOfMeasure: 'm3',
  unitCost: 800.00,
  currentStock: 100,
  minStock: 20,
  maxStock: 500
}, userId);
```

##### `searchRawMaterials(searchParams?)`
Busca materias primas con filtros opcionales.

**Parameters:**
- `searchParams?: InventorySearchParams` - Parámetros de búsqueda

**Returns:** `Promise<{ rawMaterials: RawMaterial[], totalCount: number }>`

**Example:**
```typescript
const result = await RawMaterialsService.searchRawMaterials({
  category: 'Maderas',
  lowStock: true
});
```

##### `updateRawMaterial(id, data, updatedBy)`
Actualiza una materia prima existente.

**Parameters:**
- `id: string` - ID de la materia prima
- `data: Partial<RawMaterialFormData>` - Datos a actualizar
- `updatedBy: string` - ID del usuario que actualiza

**Returns:** `Promise<RawMaterial>`

##### `updateStock(id, newStock, newAverageCost?, updatedBy?)`
Actualiza el stock de una materia prima.

**Parameters:**
- `id: string` - ID de la materia prima
- `newStock: number` - Nuevo nivel de stock
- `newAverageCost?: number` - Nuevo costo promedio
- `updatedBy?: string` - ID del usuario

**Returns:** `Promise<void>`

##### `deleteRawMaterial(id, deletedBy)`
Elimina (marca como inactiva) una materia prima.

**Parameters:**
- `id: string` - ID de la materia prima
- `deletedBy: string` - ID del usuario que elimina

**Returns:** `Promise<void>`

##### `getLowStockRawMaterials()`
Obtiene materias primas con stock bajo.

**Returns:** `Promise<RawMaterial[]>`

---

### FinishedProductsService

Servicio principal para gestión de productos terminados.

#### Methods

##### `createFinishedProduct(data, createdBy)`
Crea un nuevo producto terminado.

**Parameters:**
- `data: FinishedProductFormData` - Datos del producto
- `createdBy: string` - ID del usuario que crea

**Returns:** `Promise<FinishedProduct>`

##### `searchFinishedProducts(searchParams?)`
Busca productos terminados con filtros opcionales.

**Parameters:**
- `searchParams?: InventorySearchParams` - Parámetros de búsqueda

**Returns:** `Promise<{ finishedProducts: FinishedProduct[], totalCount: number }>`

##### `updateFinishedProduct(id, data, updatedBy)`
Actualiza un producto terminado existente.

##### `updateStock(id, newStock, updatedBy?)`
Actualiza el stock de un producto terminado.

##### `updateUnitCost(id, newUnitCost, updatedBy?)`
Actualiza el costo unitario de un producto terminado.

##### `deleteFinishedProduct(id, deletedBy)`
Elimina (marca como inactivo) un producto terminado.

##### `getLowStockFinishedProducts()`
Obtiene productos terminados con stock bajo.

---

### InventoryMovementsService

Servicio para gestión de movimientos de inventario.

#### Methods

##### `createMovement(data)`
Crea un nuevo movimiento de inventario.

**Parameters:**
- `data: InventoryMovementFormData` - Datos del movimiento

**Returns:** `Promise<InventoryMovement>`

**Example:**
```typescript
const movement = await InventoryMovementsService.createMovement({
  itemId: 'material-123',
  itemType: 'raw-material',
  type: 'Entrada',
  quantity: 50,
  reason: 'Compra nueva',
  reference: 'PO-001'
});
```

##### `getMovementsByItem(itemId, itemType)`
Obtiene movimientos de un artículo específico.

**Parameters:**
- `itemId: string` - ID del artículo
- `itemType: 'raw-material' | 'finished-product'` - Tipo de artículo

**Returns:** `Promise<InventoryMovement[]>`

##### `getRecentMovements(limit?)`
Obtiene movimientos recientes.

**Parameters:**
- `limit?: number` - Límite de resultados (default: 50)

**Returns:** `Promise<InventoryMovement[]>`

---

## Hooks

### useRawMaterials()

Hook para gestión de estado de materias primas.

**Returns:**
```typescript
{
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

### useFinishedProducts()

Hook para gestión de estado de productos terminados.

**Returns:**
```typescript
{
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

### useInventoryMovements()

Hook para gestión de estado de movimientos de inventario.

**Returns:**
```typescript
{
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

---

## Types

### RawMaterial
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
  supplier?: string;
  description?: string;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}
```

### FinishedProduct
```typescript
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
  description?: string;
  status: ProductStatus;
  bomId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}
```

### InventoryMovement
```typescript
interface InventoryMovement {
  id: string;
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  createdAt: Timestamp;
  createdBy: string;
}
```

### Enums

#### RawMaterialCategory
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
```

#### FinishedProductCategory
```typescript
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
```

#### MovementType
```typescript
type MovementType = 
  | 'Entrada'
  | 'Salida'
  | 'Ajuste'
  | 'Merma'
  | 'Produccion'
  | 'Venta'
  | 'Devolucion';
```

#### ProductStatus
```typescript
type ProductStatus = 
  | 'Disponible'
  | 'Reservado'
  | 'Vendido'
  | 'FueraDeCatalogo'
  | 'EnProduccion';
```

#### UnitOfMeasure
```typescript
type UnitOfMeasure = 
  | 'unidades'
  | 'kg' | 'g' | 'lb' | 'oz'
  | 'litros' | 'ml' | 'gal'
  | 'm3' | 'm2' | 'm' | 'cm' | 'mm'
  | 'pies' | 'pulgadas' | 'yardas';
```

---

## Utilities

### inventoryUtils

Colección de utilidades para formateo y cálculos.

#### Methods

##### `formatQuantity(quantity, unit)`
Formatea cantidad con unidad de medida.

##### `formatUnitCost(cost, currency?)`
Formatea costo unitario con moneda.

##### `calculateTotalValue(quantity, unitCost)`
Calcula valor total.

##### `getStatusColor(status)`
Obtiene color para estado de producto.

##### `getMovementTypeColor(type)`
Obtiene color para tipo de movimiento.

##### `generateSKU(category, name)`
Genera SKU automático.

##### `validateQuantity(quantity, unit)`
Valida entrada de cantidad.

### stockCalculations

Utilidades para cálculos de stock.

#### Methods

##### `calculateReorderPoint(averageDemand, leadTimeDays, safetyStock)`
Calcula punto de reorden.

##### `calculateEOQ(annualDemand, orderingCost, holdingCost)`
Calcula cantidad económica de pedido.

##### `calculateTurnoverRatio(costOfGoodsSold, averageInventoryValue)`
Calcula ratio de rotación de inventario.

---

## Error Handling

Todos los servicios y hooks incluyen manejo de errores estandarizado:

```typescript
try {
  const result = await service.method();
  return result;
} catch (error) {
  logger.error('Error message', error);
  throw new Error('User-friendly error message');
}
```

Los errores se capturan automáticamente en los hooks y se exponen en la propiedad `error`.