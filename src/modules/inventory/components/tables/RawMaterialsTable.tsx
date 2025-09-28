'use client';

import { RawMaterial, FinishedProduct } from '../../types/inventory.types';
import { InventoryTable } from '../InventoryTable';

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
  const handleDeleteItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement delete functionality
    console.log('Delete raw material:', item as RawMaterial);
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement edit functionality
    console.log('Edit raw material:', item as RawMaterial);
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement item selection
    console.log('Select raw material:', item as RawMaterial);
  };

  return (
    <InventoryTable
      items={data}
      loading={loading}
      itemType="raw-materials"
      onItemSelect={handleItemSelect}
      onDeleteItem={handleDeleteItem}
      onEditItem={handleEditItem}
      onRefresh={onRefresh}
    />
  );
}