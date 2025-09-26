'use client';

import { Trash2, Edit, Package, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RawMaterial, FinishedProduct } from '../types';
import { MovementForm } from './MovementForm';

interface InventoryTableProps {
  items: (RawMaterial | FinishedProduct)[];
  loading: boolean;
  itemType: 'raw-materials' | 'finished-products';
  onItemSelect?: (item: RawMaterial | FinishedProduct) => void;
  onDeleteItem: (item: RawMaterial | FinishedProduct) => void;
  onEditItem?: (item: RawMaterial | FinishedProduct) => void;
  onRefresh?: () => void;
}

export function InventoryTable({ 
  items, 
  loading, 
  itemType,
  onItemSelect, 
  onDeleteItem, 
  onEditItem,
  onRefresh 
}: InventoryTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Cargando inventario...</div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No hay elementos</h3>
            <p>
              {itemType === 'raw-materials' 
                ? 'No se encontraron materias primas. Agrega algunas para comenzar.'
                : 'No se encontraron productos terminados. Agrega algunos para comenzar.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) {
      return { label: 'Sin Stock', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (currentStock <= minimumStock) {
      return { label: 'Stock Bajo', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { label: 'Stock OK', variant: 'default' as const, icon: Package };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          {itemType === 'raw-materials' ? 'Materias Primas' : 'Productos Terminados'} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              {itemType === 'raw-materials' && <TableHead>Costo Unit.</TableHead>}
              {itemType === 'finished-products' && <TableHead>Precio Venta</TableHead>}
              <TableHead className="w-20">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
              const StockIcon = stockStatus.icon;
              
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemSelect?.(item)}
                >
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.currentStock}
                    {itemType === 'raw-materials' && ` ${(item as RawMaterial).unitOfMeasure}`}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.minimumStock}
                    {itemType === 'raw-materials' && ` ${(item as RawMaterial).unitOfMeasure}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                      <StockIcon className="h-3 w-3" />
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {itemType === 'raw-materials' 
                      ? `$${(item as RawMaterial).unitCost.toFixed(2)}`
                      : `$${(item as FinishedProduct).sellingPrice.toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <MovementForm
                        item={item}
                        itemType={itemType === 'raw-materials' ? 'raw-material' : 'finished-product'}
                        onSuccess={onRefresh}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-600 hover:text-green-700"
                            title="Registrar movimiento"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        }
                      />
                      {onEditItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar elemento"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar elemento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}