import { TabsContent } from '@/components/ui/tabs';
import { RawMaterialsTable, FinishedProductsTable } from './tables';
import { RawMaterial, FinishedProduct } from '../types/inventory.types';

interface InventoryTabsContentProps {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  rawMaterialsLoading: boolean;
  finishedProductsLoading: boolean;
  onRefresh: () => void;
}

export function InventoryTabsContent({ 
  rawMaterials, 
  finishedProducts, 
  rawMaterialsLoading, 
  finishedProductsLoading, 
  onRefresh 
}: InventoryTabsContentProps) {
  return (
    <>
      <TabsContent value="raw-materials">
        <RawMaterialsTable
          data={rawMaterials}
          loading={rawMaterialsLoading}
          onRefresh={onRefresh}
        />
      </TabsContent>
      
      <TabsContent value="finished-products">
        <FinishedProductsTable
          data={finishedProducts}
          loading={finishedProductsLoading}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </>
  );
}