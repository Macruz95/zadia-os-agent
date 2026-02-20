'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { RawMaterial, FinishedProduct } from '../../types';

interface StockPreviewProps {
  item: RawMaterial | FinishedProduct;
  itemType: 'raw-material' | 'finished-product';
  quantity: number;
  movementType: string;
  unitCost: number;
}

export function StockPreview({ item, itemType, quantity, movementType, unitCost }: StockPreviewProps) {
  const getItemUnit = (item: RawMaterial | FinishedProduct): string => {
    if ('unitOfMeasure' in item) {
      return item.unitOfMeasure;
    }
    return 'unidades';
  };

  const calculateNewStock = () => {
    const currentStock = item.currentStock;
    const qty = quantity || 0;

    switch (movementType) {
      case 'Entrada':
      case 'Devolucion':
        return currentStock + qty;
      case 'Salida':
      case 'Merma':
      case 'Venta':
        return Math.max(0, currentStock - qty);
      case 'Produccion':
        return itemType === 'raw-material'
          ? Math.max(0, currentStock - qty)
          : currentStock + qty;
      case 'Ajuste':
        return qty;
      default:
        return currentStock;
    }
  };

  const newStock = calculateNewStock();
  const stockChange = newStock - item.currentStock;
  const unit = getItemUnit(item);

  // Calcular información de costos
  const totalCost = Math.abs(stockChange) * unitCost;
  const getCurrentItemCost = (): number => {
    if (itemType === 'raw-material') {
      return (item as RawMaterial).unitCost || 0;
    } else {
      const finishedProduct = item as FinishedProduct;
      return (finishedProduct.laborCost || 0) + (finishedProduct.overheadCost || 0);
    }
  };

  const currentItemCost = getCurrentItemCost();
  const costDifference = unitCost - currentItemCost;
  const costImpact = Math.abs(stockChange) * costDifference;

  return (
    <div className="bg-muted/50 p-4 rounded-lg border">
      <h4 className="font-medium mb-3">Vista Previa del Movimiento</h4>

      {/* Stock Information */}
      <div className="space-y-3">
        <div className="bg-background p-3 rounded border">
          <h5 className="font-medium text-sm mb-2">Información de Stock</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Stock Actual:</span>
              <Badge variant="outline">{item.currentStock} {unit}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cambio:</span>
              <Badge variant={stockChange >= 0 ? "default" : "destructive"}>
                {stockChange > 0 ? '+' : ''}{stockChange} {unit}
              </Badge>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Nuevo Stock:</span>
              <Badge variant={newStock > 0 ? "default" : "destructive"}>
                {newStock} {unit}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cost Information */}
        <div className="bg-background p-3 rounded border">
          <h5 className="font-medium text-sm mb-2">Información de Costos</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Costo Actual por {unit}:</span>
              <Badge variant="outline">${(currentItemCost ?? 0).toFixed(2)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Nuevo Costo por {unit}:</span>
              <Badge variant={costDifference === 0 ? "outline" : costDifference > 0 ? "destructive" : "default"}>
                ${(unitCost ?? 0).toFixed(2)}
                {costDifference !== 0 && (
                  <span className="ml-1">({costDifference > 0 ? '+' : ''}${(costDifference ?? 0).toFixed(2)})</span>
                )}
              </Badge>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Costo Total del Movimiento:</span>
              <Badge variant="secondary">${(totalCost ?? 0).toFixed(2)}</Badge>
            </div>
            {costImpact !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Impacto en Valor de Inventario:</span>
                <Badge variant={costImpact > 0 ? "destructive" : "default"}>
                  {costImpact > 0 ? '+' : ''}${(costImpact ?? 0).toFixed(2)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Warnings */}
        {newStock === 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 p-2 rounded text-orange-600 dark:text-orange-400 text-xs">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            El stock quedará en cero
          </div>
        )}
        {newStock < 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 p-2 rounded text-destructive text-xs">
            <XCircle className="h-3 w-3 flex-shrink-0" />
            Stock insuficiente para esta operación
          </div>
        )}
        {Math.abs(costDifference) > currentItemCost * 0.2 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded text-yellow-600 dark:text-yellow-400 text-xs">
            <TrendingUp className="h-3 w-3 flex-shrink-0" />
            Cambio significativo en el costo (más del 20%)
          </div>
        )}
      </div>
    </div>
  );
}