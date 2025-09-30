# 🎯 ZADIA OS - Inventory Examples

## Component Examples

### 1. Raw Materials Management

```typescript
import React, { useEffect } from 'react';
import { useRawMaterials } from '@/modules/inventory/hooks';
import { InventoryForm } from '@/modules/inventory/components';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

function RawMaterialsPage() {
  const {
    rawMaterials,
    loading,
    error,
    totalCount,
    searchRawMaterials,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial
  } = useRawMaterials();

  const [showForm, setShowForm] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState(null);

  useEffect(() => {
    searchRawMaterials();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createRawMaterial(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating material:', error);
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateRawMaterial(editingMaterial.id, data);
      setEditingMaterial(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Materias Primas</h1>
          <span className="text-muted-foreground">({totalCount})</span>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Materia Prima
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingMaterial ? 'Editar' : 'Nueva'} Materia Prima
          </h2>
          <InventoryForm
            type="raw-material"
            initialData={editingMaterial}
            onSubmit={editingMaterial ? handleEdit : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingMaterial(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando materias primas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {material.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {material.sku}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {material.currentStock} {material.unitOfMeasure}
                    </div>
                    {material.currentStock <= material.minimumStock && (
                      <div className="text-xs text-red-600">Stock bajo</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Q{material.unitCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMaterial(material);
                        setShowForm(true);
                      }}
                      className="mr-2"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRawMaterial(material.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RawMaterialsPage;
```

### 2. Inventory Movements History

```typescript
import React, { useEffect } from 'react';
import { useInventoryMovements } from '@/modules/inventory/hooks';
import { inventoryUtils } from '@/modules/inventory/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react';

function MovementHistoryPage() {
  const {
    movements,
    loading,
    getRecentMovements,
    getMovementsByItem
  } = useInventoryMovements();

  useEffect(() => {
    getRecentMovements(100);
  }, []);

  const getMovementIcon = (type) => {
    switch (type) {
      case 'Entrada':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'Salida':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RotateCcw className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getMovementColor = (type) => {
    return inventoryUtils.getMovementTypeColor(type);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Historial de Movimientos</h1>
        <p className="text-muted-foreground">
          Últimos {movements.length} movimientos de inventario
        </p>
      </div>

      <div className="space-y-4">
        {movements.map((movement) => (
          <Card key={movement.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.type)}
                  <div>
                    <div className="font-medium">
                      {movement.reason || `${movement.type} de inventario`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {movement.reference && `Ref: ${movement.reference}`}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant="outline" className={`bg-${getMovementColor(movement.type)}-50`}>
                    {movement.type}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {inventoryUtils.formatInventoryDate(movement.createdAt.toDate())}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Cantidad:</span> {movement.quantity}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Stock:</span> 
                  {movement.previousStock} → {movement.newStock}
                </div>
                {movement.totalCost && (
                  <div className="text-sm">
                    <span className="font-medium">Valor:</span> 
                    {inventoryUtils.formatUnitCost(movement.totalCost)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MovementHistoryPage;
```

### 3. Low Stock Alert Dashboard

```typescript
import React, { useEffect, useState } from 'react';
import { useRawMaterials, useFinishedProducts } from '@/modules/inventory/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';

function LowStockDashboard() {
  const {
    rawMaterials: lowMaterials,
    loading: loadingMaterials,
    getLowStockMaterials
  } = useRawMaterials();
  
  const {
    finishedProducts: lowProducts,
    loading: loadingProducts,
    getLowStockProducts
  } = useFinishedProducts();

  useEffect(() => {
    getLowStockMaterials();
    getLowStockProducts();
  }, []);

  const totalLowStockItems = lowMaterials.length + lowProducts.length;
  const criticalItems = [...lowMaterials, ...lowProducts].filter(item => 
    item.currentStock <= (item.minimumStock * 0.25)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Alertas de Stock</h1>
        <p className="text-muted-foreground">
          Monitoreo de artículos con stock bajo
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Artículos necesitan reposición
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Crítico
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Artículos en nivel crítico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acciones Requeridas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes de compra pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atención:</strong> {criticalItems.length} artículos en nivel crítico de stock.
            Se recomienda realizar pedidos urgentes.
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Materials */}
      {lowMaterials.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materias Primas - Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowMaterials.map((material) => {
                const isCritical = material.currentStock <= (material.minimumStock * 0.25);
                const stockPercentage = (material.currentStock / material.minimumStock) * 100;
                
                return (
                  <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {material.category} • {material.sku}
                      </div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-sm font-medium">
                        {material.currentStock} / {material.minimumStock}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {material.unitOfMeasure}
                      </div>
                    </div>
                    
                    <div className="text-center px-4">
                      <Badge variant={isCritical ? "destructive" : "secondary"}>
                        {isCritical ? "Crítico" : "Bajo"}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stockPercentage.toFixed(0)}% del mínimo
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Ordenar
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Products */}
      {lowProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos Terminados - Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowProducts.map((product) => {
                const isCritical = product.currentStock <= (product.minimumStock * 0.25);
                const stockPercentage = (product.currentStock / product.minimumStock) * 100;
                
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category} • {product.sku}
                      </div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-sm font-medium">
                        {product.currentStock} / {product.minimumStock}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.unitOfMeasure}
                      </div>
                    </div>
                    
                    <div className="text-center px-4">
                      <Badge variant={isCritical ? "destructive" : "secondary"}>
                        {isCritical ? "Crítico" : "Bajo"}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stockPercentage.toFixed(0)}% del mínimo
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Producir
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalLowStockItems === 0 && !loadingMaterials && !loadingProducts && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Excelente!
            </h3>
            <p className="text-muted-foreground">
              Todos los artículos tienen stock suficiente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LowStockDashboard;
```

### 4. Stock Movement Form

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInventoryMovements } from '@/modules/inventory/hooks';
import { MovementTypeEnum } from '@/modules/inventory/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const movementSchema = z.object({
  itemId: z.string().min(1, 'Artículo es requerido'),
  itemType: z.enum(['raw-material', 'finished-product']),
  type: MovementTypeEnum,
  quantity: z.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function MovementForm({ onSuccess, onCancel }: MovementFormProps) {
  const { createMovement, loading } = useInventoryMovements();
  
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      itemType: 'raw-material',
      type: 'Entrada',
      quantity: 0,
      reason: '',
      reference: '',
    },
  });

  const onSubmit = async (data: MovementFormData) => {
    try {
      await createMovement(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating movement:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Artículo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="raw-material">Materia Prima</SelectItem>
                    <SelectItem value="finished-product">Producto Terminado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Movimiento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MovementTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del movimiento"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número de documento, orden, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Movimiento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default MovementForm;
```

## Service Usage Examples

### Direct Service Calls

```typescript
import { RawMaterialsService, FinishedProductsService } from '@/modules/inventory/services';

// Create new raw material
const newMaterial = await RawMaterialsService.createRawMaterial({
  name: 'Tornillos 2"',
  category: 'Herrajes',
  unitOfMeasure: 'unidades',
  unitCost: 0.50,
  currentStock: 1000,
  minStock: 100,
  maxStock: 5000,
  supplier: 'Ferretería Central'
}, userId);

// Search with filters
const lowStockMaterials = await RawMaterialsService.searchRawMaterials({
  lowStock: true,
  category: 'Maderas'
});

// Update stock
const newStock = 150;
const newCost = 850.00;
await RawMaterialsService.updateStock(
  materialId, 
  newStock, 
  newCost, 
  userId
);
```

### Utility Functions

```typescript
import { inventoryUtils, stockCalculations } from '@/modules/inventory/utils';

// Format values
const formattedQuantity = inventoryUtils.formatQuantity(25.5, 'm3');
// "25.5 m3"

const formattedCost = inventoryUtils.formatUnitCost(1250.75);
// "Q1,250.75"

const totalValue = inventoryUtils.calculateTotalValue(50, 125.50);
// 6275

// Stock calculations
const reorderPoint = stockCalculations.calculateReorderPoint(
  10,    // average daily demand
  7,     // lead time in days
  20     // safety stock
);
// 90

const eoq = stockCalculations.calculateEOQ(
  1200,  // annual demand
  50,    // ordering cost
  10     // holding cost per unit
);
// ~77.46
```