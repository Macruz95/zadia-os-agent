import { DeleteInventoryItemDialog } from './DeleteInventoryItemDialog';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';
import { RawMaterial, FinishedProduct } from '../types';

interface InventoryDialogsProps {
  deleteDialog: {
    open: boolean;
    item: RawMaterial | FinishedProduct | null;
    itemType: 'raw-materials' | 'finished-products';
  };
  editDialog: {
    open: boolean;
    item: RawMaterial | FinishedProduct | null;
    itemType: 'raw-materials' | 'finished-products';
  };
  isDeleting: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onEditDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function InventoryDialogs({
  deleteDialog,
  editDialog,
  isDeleting,
  onDeleteDialogChange,
  onEditDialogChange,
  onConfirmDelete
}: InventoryDialogsProps) {
  return (
    <>
      <DeleteInventoryItemDialog
        open={deleteDialog.open}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onConfirmDelete}
        item={deleteDialog.item}
        itemType={deleteDialog.itemType}
        loading={isDeleting}
      />

      <EditInventoryItemDialog
        open={editDialog.open}
        onOpenChange={onEditDialogChange}
        item={editDialog.item}
        itemType={editDialog.itemType}
      />
    </>
  );
}