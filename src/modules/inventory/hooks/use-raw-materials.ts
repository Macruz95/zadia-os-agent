/**
 * ZADIA OS - Use Raw Materials Hook
 * 
 * Manages raw materials state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { RawMaterial } from '../types/inventory.types';
import { RawMaterialFormData } from '../validations/inventory.schema';
import { RawMaterialsService } from '../services/entities/raw-materials-entity.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';

interface UseRawMaterialsReturn {
  rawMaterials: RawMaterial[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchRawMaterials: () => Promise<void>;
  createRawMaterial: (data: RawMaterialFormData) => Promise<RawMaterial>;
  updateRawMaterial: (id: string, data: Partial<RawMaterialFormData>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  getLowStockMaterials: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRawMaterials(): UseRawMaterialsReturn {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [lastQuery, setLastQuery] = useState<string>('search');

  const searchRawMaterials = useCallback(async () => {
    if (!tenantId) {
      setRawMaterials([]);
      setTotalCount(0);
      return;
    }
    
    try {
      setLoading(true);
      setError(undefined);

      const result = await RawMaterialsService.searchRawMaterials({ tenantId });
      setRawMaterials(result.rawMaterials);
      setTotalCount(result.totalCount);
      setLastQuery('search');
    } catch (err) {
      const errorMessage = 'Error al buscar materias primas';
      setError(errorMessage);
      logger.error('Error searching raw materials:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createRawMaterial = useCallback(async (
    data: RawMaterialFormData
  ): Promise<RawMaterial> => {
    if (!tenantId) {
      throw new Error('No se ha seleccionado una empresa');
    }
    
    try {
      setLoading(true);
      setError(undefined);

      const newMaterial = await RawMaterialsService.createRawMaterial(data, user?.uid || '', tenantId);
      
      setRawMaterials(prev => [newMaterial, ...prev]);
      setTotalCount(prev => prev + 1);

      return newMaterial;
    } catch (err) {
      const errorMessage = 'Error al crear materia prima';
      setError(errorMessage);
      logger.error('Error creating raw material:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, tenantId]);

  const updateRawMaterial = useCallback(async (
    id: string,
    data: Partial<RawMaterialFormData>
  ) => {
    try {
      setError(undefined);

      await RawMaterialsService.updateRawMaterial(id, data, user?.uid || '');
      
      // Refresh data after update
      await searchRawMaterials();

      logger.info(`Raw material updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar materia prima';
      setError(errorMessage);
      logger.error('Error updating raw material:', err as Error);
      throw err;
    }
  }, [user?.uid, searchRawMaterials]);

  const updateStock = useCallback(async (
    id: string,
    newStock: number
  ) => {
    try {
      setError(undefined);

      await RawMaterialsService.updateStock(id, newStock, undefined, user?.uid);
      
      setRawMaterials(prev => prev.map(material => 
        material.id === id ? { ...material, currentStock: newStock } : material
      ));

      logger.info(`Raw material stock updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar stock';
      setError(errorMessage);
      logger.error('Error updating stock:', err as Error);
      throw err;
    }
  }, [user?.uid]);

  const deleteRawMaterial = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await RawMaterialsService.deleteRawMaterial(id, user?.uid || '');
      
      setRawMaterials(prev => prev.filter(material => material.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Raw material deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar materia prima';
      setError(errorMessage);
      logger.error('Error deleting raw material:', err as Error);
      throw err;
    }
  }, [user?.uid]);

  const getLowStockMaterials = useCallback(async () => {
    if (!tenantId) {
      setRawMaterials([]);
      setTotalCount(0);
      return;
    }
    
    try {
      setLoading(true);
      setError(undefined);

      const result = await RawMaterialsService.getLowStockRawMaterials(tenantId);
      setRawMaterials(result);
      setTotalCount(result.length);
      setLastQuery('lowStock');
    } catch (err) {
      const errorMessage = 'Error al buscar materiales con stock bajo';
      setError(errorMessage);
      logger.error('Error getting low stock materials:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const refresh = useCallback(async () => {
    switch (lastQuery) {
      case 'lowStock':
        await getLowStockMaterials();
        break;
      default:
        await searchRawMaterials();
    }
  }, [lastQuery, searchRawMaterials, getLowStockMaterials]);

  // Load data when tenant changes
  useEffect(() => {
    if (tenantId) {
      searchRawMaterials();
    }
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    rawMaterials,
    loading,
    error,
    totalCount,
    searchRawMaterials,
    createRawMaterial,
    updateRawMaterial,
    updateStock,
    deleteRawMaterial,
    getLowStockMaterials,
    refresh,
  };
}