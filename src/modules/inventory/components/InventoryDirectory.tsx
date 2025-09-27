'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package, Hammer } from 'lucide-react';

import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useInventory } from '../hooks/use-inventory';
import { useInventoryAlerts } from '../hooks/use-inventory-alerts';
import { useInventoryKPIs } from '../hooks/use-inventory-kpis';
import { InventoryTable } from './InventoryTable';
import { DeleteInventoryItemDialog } from './DeleteInventoryItemDialog';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';
import { StockAlertsCard } from './alerts/StockAlertsCard';
import { InventoryKPIsCard } from './dashboard/InventoryKPIsCard';
import { RawMaterial, FinishedProduct } from '../types';
import { deleteRawMaterial, deleteFinishedProduct } from '../services/inventory.service';

export function InventoryDirectory() {
  const router = useRouter();
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

  const handleDeleteItem = (item: RawMaterial | FinishedProduct) => {
    const itemType = 'unitOfMeasure' in item ? 'raw-materials' : 'finished-products';
    setDeleteDialog({ open: true, item, itemType });
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    const itemType = 'unitOfMeasure' in item ? 'raw-materials' : 'finished-products';
    setEditDialog({ open: true, item, itemType });
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

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    const itemType = 'unitOfMeasure' in item ? 'raw-materials' : 'finished-products';
    router.push(`/inventory/${itemType}/${item.id}`);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona materias primas y productos terminados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/movements')}
          >
            <Search className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
          <Button onClick={() => router.push('/inventory/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ítem
          </Button>
        </div>
      </div>

      {/* Dashboard - KPIs and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryKPIsCard kpis={kpis} loading={kpisLoading} />
        </div>
        <div>
          <StockAlertsCard
            alerts={alerts}
            onRefresh={refreshAlerts}
          />
        </div>
      </div>      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={refresh}>
          Actualizar
        </Button>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Materias Primas ({rawMaterials.length})
          </TabsTrigger>
          <TabsTrigger value="finished-products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos Terminados ({finishedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials" className="space-y-4">
          <InventoryTable
            items={rawMaterials}
            loading={loading}
            itemType="raw-materials"
            onItemSelect={handleItemSelect}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onRefresh={refresh}
          />
        </TabsContent>

        <TabsContent value="finished-products" className="space-y-4">
          <InventoryTable
            items={finishedProducts}
            loading={loading}
            itemType="finished-products"
            onItemSelect={handleItemSelect}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onRefresh={refresh}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <DeleteInventoryItemDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !isDeleting && setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmDelete}
        item={deleteDialog.item}
        itemType={deleteDialog.itemType}
        loading={isDeleting}
      />

      {/* Edit Dialog */}
      <EditInventoryItemDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}
        item={editDialog.item}
        itemType={editDialog.itemType}
      />
    </div>
  );
}