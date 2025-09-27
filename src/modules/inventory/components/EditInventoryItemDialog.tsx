'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ExternalLink } from 'lucide-react';
import { RawMaterial, FinishedProduct } from '../types';

interface EditInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RawMaterial | FinishedProduct | null;
  itemType: 'raw-materials' | 'finished-products';
}

export function EditInventoryItemDialog({ 
  open, 
  onOpenChange, 
  item,
  itemType 
}: EditInventoryItemDialogProps) {
  const router = useRouter();

  if (!item) return null;

  const handleEditItem = () => {
    // For now, navigate to the item detail page where editing can be done
    // TODO: In the future, we can implement inline editing here
    router.push(`/inventory/${itemType}/${item.id}`);
    onOpenChange(false);
  };

  const getItemUnit = (item: RawMaterial | FinishedProduct): string => {
    if ('unitOfMeasure' in item) {
      return item.unitOfMeasure;
    }
    return 'unidades';
  };

  const getItemCost = (item: RawMaterial | FinishedProduct): number => {
    if ('unitCost' in item) {
      return item.unitCost;
    } else {
      const finishedProduct = item as FinishedProduct;
      return (finishedProduct.laborCost || 0) + (finishedProduct.overheadCost || 0);
    }
  };

  const itemTypeLabel = itemType === 'raw-materials' ? 'Materia Prima' : 'Producto Terminado';
  const unit = getItemUnit(item);
  const cost = getItemCost(item);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full max-w-[calc(100vw-2rem)] mx-4">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar {itemTypeLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">{item.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">SKU:</span>
                <Badge variant="outline">{item.sku}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Stock Actual:</span>
                <Badge variant={item.currentStock > 0 ? "default" : "destructive"}>
                  {item.currentStock} {unit}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Costo:</span>
                <Badge variant="secondary">${cost.toFixed(2)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Categoría:</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </div>
          </div>

          {/* Action Message */}
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-sm text-gray-600 mb-2">
              Se abrirá la página de detalles del ítem donde podrás editar toda la información.
            </p>
            <p className="text-xs text-gray-500">
              En la página de detalles encontrarás opciones completas de edición.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleEditItem}
            >
              <ExternalLink className="h-4 w-4" />
              Ir a Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}