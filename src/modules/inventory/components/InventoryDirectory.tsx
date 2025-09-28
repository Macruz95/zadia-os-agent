'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useInventory } from '../hooks/use-inventory';
import { useInventoryAlerts } from '../hooks/use-inventory-alerts';
import { useInventoryKPIs } from '../hooks/use-inventory-kpis';
import { InventoryDirectoryHeader } from './InventoryDirectoryHeader';
import { InventoryDashboard } from './InventoryDashboard';
import { InventoryTabsContent } from './InventoryTabsContent';
import { InventoryDialogs } from './InventoryDialogs';
import { RawMaterial, FinishedProduct } from '../types';
import { deleteRawMaterial, deleteFinishedProduct } from '../services/inventory.service';

export function InventoryDirectory() {
  const {
    rawMaterials,
    finishedProducts,
    loading,
    error,
    searchParams,
    activeTab,
    updateSearchParams,
    switchTab,
    refresh
  } = useInventory();

  // Alerts and KPIs hooks
  const { alerts, refreshAlerts, checkStockLevels } = useInventoryAlerts();
  const { kpis, loading: kpisLoading, refreshKPIs } = useInventoryKPIs();

  const [searchQuery, setSearchQuery] = useState(searchParams.query || '');

  // Load all inventory data for KPIs
  useEffect(() => {
    const loadAllInventoryData = async () => {
      if (!loading) {
        try {
          // Load both raw materials and finished products for KPIs
          const [rmResult, fpResult] = await Promise.all([
            import('../services/inventory.service').then(service => 
              service.searchRawMaterials({})
            ),
            import('../services/inventory.service').then(service => 
              service.searchFinishedProducts({})
            )
          ]);
          
          // Calculate KPIs with all data
          refreshKPIs(rmResult.rawMaterials, fpResult.finishedProducts);
          checkStockLevels(rmResult.rawMaterials, fpResult.finishedProducts);
        } catch (error) {
          logger.error('Error loading inventory data for KPIs:', error as Error);
        }
      }
    };

    loadAllInventoryData();
  }, [loading, refreshKPIs, checkStockLevels]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: RawMaterial | FinishedProduct | null;
    itemType: 'raw-materials' | 'finished-products';
  }>({ open: false, item: null, itemType: 'raw-materials' });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: RawMaterial | FinishedProduct | null;
    itemType: 'raw-materials' | 'finished-products';
  }>({ open: false, item: null, itemType: 'raw-materials' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams({ query: query || undefined, page: 1 });
  };

  const handleTabChange = (tab: string) => {
    switchTab(tab as 'raw-materials' | 'finished-products');
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    
    setIsDeleting(true);
    try {
      // TODO: Implementar AuthContext para obtener usuario actual
      const deletedBy = 'system-user'; // Temporal hasta implementar auth context
      
      if (deleteDialog.itemType === 'raw-materials') {
        await deleteRawMaterial(deleteDialog.item.id, deletedBy);
        toast.success(`Materia prima "${deleteDialog.item.name}" eliminada correctamente`);
      } else {
        await deleteFinishedProduct(deleteDialog.item.id, deletedBy);
        toast.success(`Producto terminado "${deleteDialog.item.name}" eliminado correctamente`);
      }
      
      // Close dialog and refresh data
      setDeleteDialog({ open: false, item: null, itemType: 'raw-materials' });
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el ítem';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Error: {error}
          <Button onClick={refresh} className="ml-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <InventoryDirectoryHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={refresh}
      />

      <InventoryDashboard
        kpis={kpis}
        kpisLoading={kpisLoading}
        alerts={alerts}
        onRefreshAlerts={refreshAlerts}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            Materias Primas ({rawMaterials.length})
          </TabsTrigger>
          <TabsTrigger value="finished-products" className="flex items-center gap-2">
            Productos Terminados ({finishedProducts.length})
          </TabsTrigger>
        </TabsList>

        <InventoryTabsContent
          rawMaterials={rawMaterials}
          finishedProducts={finishedProducts}
          rawMaterialsLoading={loading}
          finishedProductsLoading={loading}
          onRefresh={refresh}
        />
      </Tabs>

      <InventoryDialogs
        deleteDialog={deleteDialog}
        editDialog={editDialog}
        isDeleting={isDeleting}
        onDeleteDialogChange={(open: boolean) => !isDeleting && setDeleteDialog(prev => ({ ...prev, open }))}
        onEditDialogChange={(open: boolean) => setEditDialog(prev => ({ ...prev, open }))}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}