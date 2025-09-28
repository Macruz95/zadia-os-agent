'use client';

import { RawMaterial, FinishedProduct } from '../../types/inventory.types';
import { InventoryTable } from '../InventoryTable';

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
  const handleDeleteItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement delete functionality
    console.log('Delete finished product:', item as FinishedProduct);
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement edit functionality
    console.log('Edit finished product:', item as FinishedProduct);
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement item selection
    console.log('Select finished product:', item as FinishedProduct);
  };

  return (
    <InventoryTable
      items={data}
      loading={loading}
      itemType="finished-products"
      onItemSelect={handleItemSelect}
      onDeleteItem={handleDeleteItem}
      onEditItem={handleEditItem}
      onRefresh={onRefresh}
    />
  );
}