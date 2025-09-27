'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RawMaterial, FinishedProduct } from '../types';
import { RawMaterialEditForm } from './forms/RawMaterialEditForm';
import { FinishedProductEditForm } from './forms/FinishedProductEditForm';
import { useEditInventoryForm } from '../hooks/use-edit-inventory-form';

interface EditInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RawMaterial | FinishedProduct | null;
  itemType: 'raw-materials' | 'finished-products';
  onSuccess?: () => void;
}

export function EditInventoryItemDialog({ 
  open, 
  onOpenChange, 
  item,
  itemType,
  onSuccess
}: EditInventoryItemDialogProps) {
  const {
    isRawMaterial,
    isSubmitting,
    rawMaterialForm,
    finishedProductForm,
    handleSubmit,
  } = useEditInventoryForm({
    item,
    itemType,
    open,
    onSuccess,
    onOpenChange,
  });

  if (!item) return null;

  const itemTypeLabel = isRawMaterial ? 'Materia Prima' : 'Producto Terminado';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] mx-4 overflow-y-auto">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            Editar {itemTypeLabel}
          </DialogTitle>
        </DialogHeader>

        {isRawMaterial ? (
          <RawMaterialEditForm 
            form={rawMaterialForm} 
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        ) : (
          <FinishedProductEditForm 
            form={finishedProductForm}
            onSubmit={handleSubmit} 
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
