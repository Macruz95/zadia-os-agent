/**
 * ZADIA OS - Use Inventory Movements Hook
 * 
 * Manages inventory movements state and operations
 */

import { useState, useCallback } from 'react';
import { InventoryMovement } from '../types/inventory.types';
import { InventoryMovementsService } from '../services/entities/inventory-movements-entity.service';
import { logger } from '@/lib/logger';

interface UseInventoryMovementsReturn {
  movements: InventoryMovement[];
  loading: boolean;
  error?: string;
  totalCount: number;
  getMovementsByItem: (itemId: string, itemType: 'raw-material' | 'finished-product') => Promise<void>;
  getRecentMovements: (limit?: number) => Promise<void>;
  createMovement: (data: any) => Promise<InventoryMovement>;
  refresh: () => Promise<void>;
}

export function useInventoryMovements(): UseInventoryMovementsReturn {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [lastQuery, setLastQuery] = useState<{ type: string; params: any }>();

  const getMovementsByItem = useCallback(async (
    itemId: string,
    itemType: 'raw-material' | 'finished-product'
  ) => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await InventoryMovementsService.getMovementsByItem(itemId, itemType);
      setMovements(result);
      setTotalCount(result.length);
      setLastQuery({ type: 'byItem', params: { itemId, itemType } });
    } catch (err) {
      const errorMessage = 'Error al cargar movimientos por artículo';
      setError(errorMessage);
      logger.error('Error loading movements by item:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentMovements = useCallback(async (limit: number = 50) => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await InventoryMovementsService.getRecentMovements(limit);
      setMovements(result);
      setTotalCount(result.length);
      setLastQuery({ type: 'recent', params: { limit } });
    } catch (err) {
      const errorMessage = 'Error al cargar movimientos recientes';
      setError(errorMessage);
      logger.error('Error loading recent movements:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMovement = useCallback(async (
    data: any
  ): Promise<InventoryMovement> => {
    try {
      setLoading(true);
      setError(undefined);

      const newMovement = await InventoryMovementsService.createMovement(data);
      
      setMovements(prev => [newMovement, ...prev]);
      setTotalCount(prev => prev + 1);

      return newMovement;
    } catch (err) {
      const errorMessage = 'Error al crear movimiento';
      setError(errorMessage);
      logger.error('Error creating movement:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (lastQuery) {
      switch (lastQuery.type) {
        case 'byItem':
          await getMovementsByItem(lastQuery.params.itemId, lastQuery.params.itemType);
          break;
        case 'recent':
          await getRecentMovements(lastQuery.params.limit);
          break;
        default:
          await getRecentMovements();
      }
    } else {
      await getRecentMovements();
    }
  }, [lastQuery, getMovementsByItem, getRecentMovements]);

  return {
    movements,
    loading,
    error,
    totalCount,
    getMovementsByItem,
    getRecentMovements,
    createMovement,
    refresh,
  };
}