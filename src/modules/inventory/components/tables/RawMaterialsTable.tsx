'use client';

import { logger } from '@/lib/logger';
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
    logger.info('Delete raw material action triggered', {
      component: 'RawMaterialsTable',
      action: 'handleDeleteItem',
      metadata: { itemId: (item as RawMaterial).id }
    });
  };

  const handleEditItem = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement edit functionality
    logger.info('Edit raw material action triggered', {
      component: 'RawMaterialsTable',
      action: 'handleEditItem',
      metadata: { itemId: (item as RawMaterial).id }
    });
  };

  const handleItemSelect = (item: RawMaterial | FinishedProduct) => {
    // TODO: Implement item selection
    logger.info('Raw material selected', {
      component: 'RawMaterialsTable',
      action: 'handleItemSelect',
      metadata: { itemId: (item as RawMaterial).id }
    });
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