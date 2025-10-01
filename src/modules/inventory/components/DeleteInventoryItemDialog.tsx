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
import { AlertTriangle } from 'lucide-react';
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
          <AlertDialogDescription>
            Esta acción eliminará permanentemente <strong>{item.name}</strong>.
            {item.currentStock > 0 && (
              <span className="block mt-2 text-orange-600 font-medium">
                ⚠️ Este ítem tiene {item.currentStock} unidades en stock.
              </span>
            )}
            <span className="block mt-2 text-red-600 font-medium">
              Esta operación no se puede deshacer.
            </span>
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