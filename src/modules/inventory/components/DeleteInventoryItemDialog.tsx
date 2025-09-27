'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RawMaterial, FinishedProduct } from '../types';

interface DeleteInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  item: RawMaterial | FinishedProduct | null;
  itemType: 'raw-materials' | 'finished-products';
  loading?: boolean;
}

export function DeleteInventoryItemDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  item,
  itemType,
  loading = false
}: DeleteInventoryItemDialogProps) {
  if (!item) return null;

  const itemTypeLabel = itemType === 'raw-materials' ? 'materia prima' : 'producto terminado';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {itemTypeLabel}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción eliminará permanentemente <strong>{item.name}</strong>.
            </p>
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Información del ítem:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• SKU: {item.sku}</li>
                <li>• Stock actual: {item.currentStock}</li>
                {item.currentStock > 0 && (
                  <li className="text-red-600 font-medium">
                    • ⚠️ Este ítem tiene stock disponible
                  </li>
                )}
              </ul>
            </div>
            <p className="text-red-600 font-medium">
              Esta operación no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}