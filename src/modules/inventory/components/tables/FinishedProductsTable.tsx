'use client';

import { logger } from '@/lib/logger';
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
    logger.info('Delete finished product action triggered', {
      component: 'FinishedProductsTable',
      action: 'handleDeleteItem',
      metadata: { itemId: (item as FinishedProduct).id }
    });
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement edit functionality
    logger.info('Edit finished product action triggered', {
      component: 'FinishedProductsTable',
      action: 'handleEditItem',
      metadata: { itemId: (item as FinishedProduct).id }
    });
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement item selection
    logger.info('Finished product selected', {
      component: 'FinishedProductsTable',
      action: 'handleItemSelect',
      metadata: { itemId: (item as FinishedProduct).id }
    });
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