'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RawMaterial, FinishedProduct } from '../../types/inventory.types';
import { InventoryTable } from '../InventoryTable';
import { RawMaterialsService } from '../../services/entities/raw-materials-entity.service';
import { EditInventoryItemDialog } from '../EditInventoryItemDialog';

interface RawMaterialsTableProps {
  data: RawMaterial[];
  loading: boolean;
  onRefresh: () => void;
}

export function RawMaterialsTable({ 
  data, 
  loading, 
  onRefresh 
}: RawMaterialsTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: RawMaterial | null }>({ open: false, item: null });
  const [editDialog, setEditDialog] = useState<{ open: boolean; item: RawMaterial | null }>({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteItem = (item: RawMaterial | FinishedProduct) => {
    setDeleteDialog({ open: true, item: item as RawMaterial });
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    setEditDialog({ open: true, item: item as RawMaterial });
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    const rawMaterial = item as RawMaterial;
    router.push(`/inventory/raw-materials/${rawMaterial.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item || !user) {
      if (!user) toast.error('Usuario no autenticado');
      return;
    }
    
    setIsDeleting(true);
    try {
      await RawMaterialsService.deleteRawMaterial(deleteDialog.item.id, user.uid);
      toast.success(`Materia prima "${deleteDialog.item.name}" eliminada correctamente`);
      
      setDeleteDialog({ open: false, item: null });
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la materia prima';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setEditDialog({ open: false, item: null });
    onRefresh();
  };

  return (
    <>
      <InventoryTable
        items={data}
        loading={loading}
        itemType="raw-materials"
        onItemSelect={handleItemSelect}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
        onRefresh={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar materia prima?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la materia prima "{deleteDialog.item?.name}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editDialog.item && (
        <EditInventoryItemDialog
          open={editDialog.open}
          onOpenChange={(open: boolean) => setEditDialog(prev => ({ ...prev, open }))}
          item={editDialog.item}
          itemType="raw-materials"
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}