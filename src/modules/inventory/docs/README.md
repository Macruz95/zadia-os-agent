# 📦 ZADIA OS - Inventory Module

## Overview

El módulo de Inventario gestiona materias primas, productos terminados y movimientos de inventario en ZADIA OS. Proporciona funcionalidades completas para el control de stock, costos y trazabilidad.

## 🏗️ Architecture

```
src/modules/inventory/
├── components/           # Componentes React para UI
├── hooks/               # Hooks personalizados para estado
├── services/            # Servicios de datos y lógica de negocio
├── types/               # Definiciones de tipos TypeScript
├── utils/               # Utilidades y helpers
├── validations/         # Esquemas de validación Zod
└── docs/               # Documentación del módulo
```

## 🚀 Quick Start

### Importar componentes principales
```typescript
import { InventoryDirectory } from '@/modules/inventory/components';
import { InventoryForm } from '@/modules/inventory/components';
```

### Usar hooks de estado
```typescript
import { useRawMaterials, useFinishedProducts, useInventoryMovements } from '@/modules/inventory/hooks';

function MyComponent() {
  const { rawMaterials, loading, searchRawMaterials } = useRawMaterials();
  
  useEffect(() => {
    searchRawMaterials();
  }, []);
  
  return (
    <div>
      {loading ? 'Cargando...' : rawMaterials.map(material => (
        <div key={material.id}>{material.name}</div>
      ))}
    </div>
  );
}
```

### Usar servicios directamente
```typescript
import { RawMaterialsService } from '@/modules/inventory/services';

const materials = await RawMaterialsService.searchRawMaterials();
const newMaterial = await RawMaterialsService.createRawMaterial(data, userId);
```

## 📊 Key Features

### ✅ Raw Materials Management
- ✅ CRUD operations for raw materials
- ✅ Stock level tracking and alerts
- ✅ Category-based organization
- ✅ Supplier management
- ✅ Cost tracking with average cost method

### ✅ Finished Products Management
- ✅ Product catalog management
- ✅ BOM (Bill of Materials) integration
- ✅ Pricing and margin calculations
- ✅ Multi-category organization
- ✅ Stock control and alerts

### ✅ Inventory Movements
- ✅ Complete movement history
- ✅ Multiple movement types (Entry, Exit, Adjustment, etc.)
- ✅ Automatic stock updates
- ✅ Audit trail and traceability
- ✅ Batch and serial number tracking

### ✅ Analytics and Reporting
- ✅ KPI dashboard
- ✅ Stock valuation reports
- ✅ Low stock alerts
- ✅ Movement analytics
- ✅ Cost analysis

## 🔧 Configuration

### Default Settings
```typescript
const defaultConfig = {
  currency: 'GTQ',
  costingMethod: 'Promedio',
  lowStockThreshold: 10,
  autoGenerateSKU: true
};
```

### Custom Categories
```typescript
// Raw Material Categories
const rawMaterialCategories = [
  'Maderas', 'Acabados', 'Adhesivos', 'Herrajes', 
  'Químicos', 'Textiles', 'Herramientas', 'Otros'
];

// Finished Product Categories
const finishedProductCategories = [
  'Dormitorio', 'Oficina', 'Sala', 'Cocina', 'Comedor', 
  'Baño', 'Infantil', 'Exterior', 'Otros'
];
```

## 📝 Usage Examples

### Creating a Raw Material
```typescript
const { createRawMaterial } = useRawMaterials();

const newMaterial = await createRawMaterial({
  name: 'Madera Caoba',
  description: 'Madera caoba premium',
  category: 'Maderas',
  unitOfMeasure: 'm3',
  unitCost: 1500.00,
  currentStock: 50,
  minStock: 10,
  maxStock: 200,
  supplier: 'Maderería San Juan'
});
```

### Creating a Movement
```typescript
const { createMovement } = useInventoryMovements();

const movement = await createMovement({
  itemId: 'material-123',
  itemType: 'raw-material',
  type: 'Entrada',
  quantity: 25,
  reason: 'Compra a proveedor',
  reference: 'PO-2024-001'
});
```

### Checking Low Stock
```typescript
const { getLowStockMaterials } = useRawMaterials();
const { getLowStockProducts } = useFinishedProducts();

const lowStockMaterials = await getLowStockMaterials();
const lowStockProducts = await getLowStockProducts();
```

## 🎨 UI Components

### InventoryForm
Formulario genérico para crear y editar artículos de inventario.

```typescript
<InventoryForm
  type="raw-material" // or "finished-product"
  initialData={material}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={loading}
/>
```

### InventoryDirectory
Directorio principal con tabla, filtros y acciones.

```typescript
<InventoryDirectory
  type="raw-materials"
  title="Materias Primas"
  description="Gestión de materias primas"
/>
```

## 🔄 State Management

Todos los hooks siguen el mismo patrón:

```typescript
const {
  items,           // Array de elementos
  loading,         // Estado de carga
  error,           // Mensaje de error
  totalCount,      // Total de elementos
  searchItems,     // Buscar elementos
  createItem,      // Crear nuevo elemento
  updateItem,      // Actualizar elemento
  deleteItem,      // Eliminar elemento
  refresh          // Refrescar datos
} = useInventoryHook();
```

## 🔍 Search and Filtering

```typescript
const filters = {
  category: 'Maderas',
  status: 'Disponible',
  lowStock: true,
  searchTerm: 'caoba'
};

const results = await RawMaterialsService.searchRawMaterials(filters);
```

## 🚨 Error Handling

Todos los hooks incluyen manejo de errores:

```typescript
const { error, createRawMaterial } = useRawMaterials();

try {
  await createRawMaterial(data);
} catch (err) {
  // Error capturado automáticamente en el estado
  console.log(error); // "Error al crear materia prima"
}
```

## 📊 Analytics Integration

```typescript
const { metrics, loadMetrics } = useInventoryKPIs();

useEffect(() => {
  loadMetrics();
}, []);

// metrics contiene:
// - totalValue: Valor total del inventario
// - totalItems: Total de artículos
// - lowStockItems: Artículos con stock bajo
// - movementsToday: Movimientos del día
```

## 🔒 Permissions

El módulo respeta los permisos del usuario:

```typescript
// Solo usuarios con permisos pueden:
// - Crear/editar/eliminar artículos
// - Realizar movimientos de inventario
// - Ver reportes financieros
// - Modificar configuración
```

## 🎯 Best Practices

1. **Usar hooks** para manejo de estado en componentes
2. **Servicios directos** solo para lógica compleja
3. **Validación** siempre con esquemas Zod
4. **Manejo de errores** en todas las operaciones
5. **Optimistic updates** para mejor UX
6. **Logging** de todas las operaciones críticas

## 🔗 Related Modules

- **Sales**: Integración con cotizaciones y ventas
- **Production**: Consumo de materias primas
- **Purchasing**: Entradas de inventario
- **Accounting**: Valuación y costos

## 📚 Additional Resources

- [API Reference](./API.md)
- [Examples](./examples.md)
- [Migration Guide](./migration.md)
- [Testing Guide](./testing.md)