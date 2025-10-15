'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RawMaterial, FinishedProduct } from '../../types/inventory.types';
import { InventoryTable } from '../InventoryTable';
import { FinishedProductsService } from '../../services/entities/finished-products-entity.service';
import { EditInventoryItemDialog } from '../EditInventoryItemDialog';

interface FinishedProductsTableProps {
  data: FinishedProduct[];
  loading: boolean;
  onRefresh: () => void;
}

export function FinishedProductsTable({ 
  data, 
  loading, 
  onRefresh 
}: FinishedProductsTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: FinishedProduct | null }>({ open: false, item: null });
  const [editDialog, setEditDialog] = useState<{ open: boolean; item: FinishedProduct | null }>({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteItem = (item: RawMaterial | FinishedProduct) => {
    setDeleteDialog({ open: true, item: item as FinishedProduct });
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    setEditDialog({ open: true, item: item as FinishedProduct });
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    const finishedProduct = item as FinishedProduct;
    router.push(`/inventory/finished-products/${finishedProduct.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }
    
    setIsDeleting(true);
    try {
      await FinishedProductsService.deleteFinishedProduct(deleteDialog.item.id, user.uid);
      toast.success(`Producto terminado "${deleteDialog.item.name}" eliminado correctamente`);
      
      setDeleteDialog({ open: false, item: null });
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el producto terminado';
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
        itemType="finished-products"
        onItemSelect={handleItemSelect}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
        onRefresh={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto terminado?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el producto terminado "{deleteDialog.item?.name}"?
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
          itemType="finished-products"
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}