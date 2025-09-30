# 📦 ZADIA OS - Inventory Module

## Overview

El módulo Inventory gestiona todo el inventario de la empresa, incluyendo materias primas, productos terminados, movimientos de inventario, alertas y KPIs.

## Features

### 🏭 Raw Materials Management
- ✅ Gestión completa de materias primas
- ✅ Control de stock mínimo y máximo
- ✅ Cálculo automático de costos promedio
- ✅ Alertas de stock bajo
- ✅ Categorización por tipo de material

### 🛋️ Finished Products Management
- ✅ Gestión de productos terminados
- ✅ Control de costos de producción
- ✅ Precios de venta y márgenes
- ✅ Bill of Materials (BOM)
- ✅ Categorización por tipo de mueble

### 📊 Inventory Movements
- ✅ Registro de entradas y salidas
- ✅ Movimientos de ajuste y mermas
- ✅ Transferencias entre ubicaciones
- ✅ Histórico completo de movimientos
- ✅ Trazabilidad total

### 🚨 Alerts & Notifications
- ✅ Alertas de stock bajo
- ✅ Notificaciones de stock crítico
- ✅ Alertas de productos obsoletos
- ✅ Recordatorios de reorden

### 📈 Analytics & KPIs
- ✅ Valor total de inventario
- ✅ Rotación de inventario
- ✅ Análisis ABC de productos
- ✅ Tendencias de consumo
- ✅ Reportes de eficiencia

## Quick Start

### Raw Materials Hook
```typescript
import { useRawMaterials } from '@/modules/inventory/hooks';

function RawMaterialsComponent() {
  const {
    rawMaterials,
    loading,
    error,
    searchRawMaterials,
    createRawMaterial,
    updateStock
  } = useRawMaterials();

  useEffect(() => {
    searchRawMaterials();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {rawMaterials.map(material => (
        <div key={material.id}>
          {material.name} - Stock: {material.currentStock}
        </div>
      ))}
    </div>
  );
}
```

### Finished Products Hook
```typescript
import { useFinishedProducts } from '@/modules/inventory/hooks';

function ProductsComponent() {
  const {
    finishedProducts,
    loading,
    createFinishedProduct,
    updateUnitCost
  } = useFinishedProducts();

  const handleCreateProduct = async (data) => {
    try {
      await createFinishedProduct(data);
      toast.success('Producto creado exitosamente');
    } catch (error) {
      toast.error('Error al crear producto');
    }
  };

  return (
    <InventoryForm
      type="finished-product"
      onSubmit={handleCreateProduct}
      isLoading={loading}
    />
  );
}
```

### Inventory Movements Hook
```typescript
import { useInventoryMovements } from '@/modules/inventory/hooks';

function MovementsComponent() {
  const {
    movements,
    getMovementsByItem,
    createMovement
  } = useInventoryMovements();

  const handleStockAdjustment = async (itemId, newStock) => {
    await createMovement({
      itemId,
      itemType: 'raw-material',
      movementType: 'Ajuste',
      quantity: newStock,
      reason: 'Ajuste de inventario'
    });
  };

  return (
    <div>
      {/* Movement history table */}
    </div>
  );
}
```

## Utilities

### Formatting
```typescript
import { inventoryUtils } from '@/modules/inventory/utils';

// Format quantities
const formattedQty = inventoryUtils.formatQuantity(25.5, 'kg');
// Output: "25.5 kg"

// Format costs
const formattedCost = inventoryUtils.formatUnitCost(125.50);
// Output: "Q125.50"

// Calculate total value
const totalValue = inventoryUtils.calculateTotalValue(10, 125.50);
// Output: 1255

// Get status colors
const statusColor = inventoryUtils.getStatusColor('Disponible');
// Output: "green"
```

### Stock Calculations
```typescript
import { stockCalculations } from '@/modules/inventory/utils';

// Calculate reorder point
const reorderPoint = stockCalculations.calculateReorderPoint(
  averageDemand: 10,
  leadTimeDays: 5,
  safetyStock: 15
);
// Output: 65

// Calculate EOQ
const eoq = stockCalculations.calculateEOQ(
  annualDemand: 1200,
  orderingCost: 50,
  holdingCost: 2
);
// Output: 245
```

## Components

### InventoryForm
Formulario universal para crear/editar materias primas y productos terminados.

**Props:**
- `type`: 'raw-material' | 'finished-product'
- `initialData?`: Datos iniciales para edición
- `onSubmit`: Función callback al enviar
- `onCancel`: Función callback al cancelar
- `isLoading?`: Estado de carga

### InventoryTable
Tabla para mostrar inventario con filtros y paginación.

### InventoryDirectory
Vista principal del directorio de inventario.

## Services Architecture

### Entity Services
- `RawMaterialsService`: Gestión de materias primas
- `FinishedProductsService`: Gestión de productos terminados
- `InventoryMovementsService`: Gestión de movimientos
- `InventoryAlertsService`: Sistema de alertas
- `InventoryKPIsService`: Métricas y análisis
- `BOMService`: Bill of Materials

### Service Methods
```typescript
// Raw Materials
RawMaterialsService.createRawMaterial(data, createdBy)
RawMaterialsService.searchRawMaterials(params?)
RawMaterialsService.updateStock(id, newStock, avgCost?, updatedBy?)
RawMaterialsService.getLowStockRawMaterials()

// Finished Products
FinishedProductsService.createFinishedProduct(data, createdBy)
FinishedProductsService.searchFinishedProducts(params?)
FinishedProductsService.updateUnitCost(id, newCost, updatedBy?)
FinishedProductsService.getLowStockFinishedProducts()

// Movements
InventoryMovementsService.createMovement(data)
InventoryMovementsService.getMovementsByItem(itemId, itemType)
InventoryMovementsService.getRecentMovements(limit?)
```

## Types

### Core Types
```typescript
type RawMaterialCategory = 'Maderas' | 'Acabados' | 'Adhesivos' | 'Herrajes' | 'Químicos' | 'Textiles' | 'Herramientas' | 'Otros'
type FinishedProductCategory = 'Dormitorio' | 'Oficina' | 'Sala' | 'Cocina' | 'Comedor' | 'Baño' | 'Infantil' | 'Exterior' | 'Otros'
type UnitOfMeasure = 'unidades' | 'kg' | 'g' | 'lb' | 'litros' | 'ml' | 'm3' | 'm2' | 'm' | 'cm'
type ProductStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'FueraDeCatalogo' | 'EnProduccion'
type MovementType = 'Entrada' | 'Salida' | 'Ajuste' | 'Merma' | 'Produccion' | 'Venta' | 'Devolucion'
```

### Interfaces
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
  // ... more fields
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
  // ... more fields
}
```

## Validation Schemas

Using Zod for runtime validation:

```typescript
import { RawMaterialFormSchema, FinishedProductFormSchema } from '@/modules/inventory/validations';

// Validate raw material data
const validatedData = RawMaterialFormSchema.parse(formData);

// Validate finished product data
const validatedProduct = FinishedProductFormSchema.parse(productData);
```

## Error Handling

Todos los hooks incluyen manejo de errores estandarizado:

```typescript
const { error, clearError } = useRawMaterials();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
      <Button onClick={clearError}>Reintentar</Button>
    </Alert>
  );
}
```

## Best Practices

### 1. **Consistent State Management**
- Usar hooks para manejo de estado
- Implementar loading states
- Manejar errores apropiadamente

### 2. **Data Validation**
- Validar datos en frontend y backend
- Usar Zod schemas consistentemente
- Mostrar errores de validación claramente

### 3. **Performance**
- Implementar paginación para listas grandes
- Usar optimistic updates cuando sea apropiado
- Cachear datos frecuentemente accedidos

### 4. **User Experience**
- Mostrar estados de carga
- Proporcionar feedback inmediato
- Implementar confirmaciones para acciones destructivas

## Module Structure

```
src/modules/inventory/
├── components/           # React components
│   ├── InventoryForm.tsx
│   ├── InventoryTable.tsx
│   └── InventoryDirectory.tsx
├── hooks/               # Custom hooks
│   ├── use-raw-materials.ts
│   ├── use-finished-products.ts
│   └── use-inventory-movements.ts
├── services/            # API services
│   ├── entities/
│   └── inventory.service.ts
├── types/               # TypeScript types
│   └── inventory.types.ts
├── validations/         # Zod schemas
│   └── inventory.schema.ts
├── utils/               # Utility functions
│   └── inventory.utils.ts
├── docs/                # Documentation
│   └── README.md
└── index.ts            # Main exports
```