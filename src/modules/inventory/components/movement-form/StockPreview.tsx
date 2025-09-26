'use client';

import { Badge } from '@/components/ui/badge';
import { RawMaterial, FinishedProduct } from '../../types';

interface StockPreviewProps {
  item: RawMaterial | FinishedProduct;
  itemType: 'raw-material' | 'finished-product';
  quantity: number;
  movementType: string;
}

export function StockPreview({ item, itemType, quantity, movementType }: StockPreviewProps) {
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

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium mb-3">Vista Previa del Stock</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Stock Actual:</span>
          <Badge variant="outline">{item.currentStock} {unit}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Cambio:</span>
          <Badge variant={stockChange >= 0 ? "default" : "destructive"}>
            {stockChange > 0 ? '+' : ''}{stockChange} {unit}
          </Badge>
        </div>
        <div className="flex justify-between font-medium">
          <span>Nuevo Stock:</span>
          <Badge variant={newStock > 0 ? "default" : "destructive"}>
            {newStock} {unit}
          </Badge>
        </div>
        {newStock === 0 && (
          <div className="text-orange-600 text-xs mt-2">
            ⚠️ El stock quedará en cero
          </div>
        )}
        {newStock < 0 && (
          <div className="text-red-600 text-xs mt-2">
            ❌ Stock insuficiente para esta operación
          </div>
        )}
      </div>
    </div>
  );
}