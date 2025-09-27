/**
 * ZADIA OS - Use BOM Hook
 * 
 * Manages Bill of Materials state and operations
 */

import { useState, useCallback } from 'react';
import { BillOfMaterials, BOMItem } from '../types/inventory.types';
import { BOMService } from '../services/entities/bom.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface UseBOMReturn {
  bom?: BillOfMaterials;
  boms: BillOfMaterials[];
  loading: boolean;
  error?: string;
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  productionFeasibility?: {
    canProduce: boolean;
    maxQuantityPossible: number;
    missingMaterials: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      missing: number;
    }>;
  };
  createBOM: (bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBOM: (id: string, bomData: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deactivateBOM: (id: string) => Promise<void>;
  getBOMsForProduct: (finishedProductId: string) => Promise<void>;
  getActiveBOMForProduct: (finishedProductId: string) => Promise<void>;
  validateBOMItems: (items: BOMItem[]) => Promise<void>;
  calculateProductionFeasibility: (bomId: string, quantity: number) => Promise<void>;
}

export function useBOM(): UseBOMReturn {
  const [bom, setBom] = useState<BillOfMaterials>();
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>();
  const [productionFeasibility, setProductionFeasibility] = useState<{
    canProduce: boolean;
    maxQuantityPossible: number;
    missingMaterials: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      missing: number;
    }>;
  }>();

  const { user } = useAuth();

  const createBOM = useCallback(async (bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      const newBOM = await BOMService.createBOM(bomData, user.uid);
      setBom(newBOM);
      
      // Refresh BOMs list if we have product ID
      if (bomData.finishedProductId) {
        const updatedBoms = await BOMService.getBOMsForProduct(bomData.finishedProductId);
        setBoms(updatedBoms);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear BOM';
      setError(errorMessage);
      logger.error('Error creating BOM:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBOM = useCallback(async (
    id: string, 
    bomData: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      await BOMService.updateBOM(id, bomData, user.uid);
      
      // Refresh current BOM
      const updatedBOM = await BOMService.getBOMById(id);
      if (updatedBOM) {
        setBom(updatedBOM);
        
        // Update in BOMs list
        setBoms(prev => 
          prev.map(b => b.id === id ? updatedBOM : b)
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar BOM';
      setError(errorMessage);
      logger.error('Error updating BOM:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deactivateBOM = useCallback(async (id: string) => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      await BOMService.deactivateBOM(id, user.uid);
      
      // Remove from current state
      setBoms(prev => prev.filter(b => b.id !== id));
      if (bom?.id === id) {
        setBom(undefined);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar BOM';
      setError(errorMessage);
      logger.error('Error deactivating BOM:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, bom]);

  const getBOMsForProduct = useCallback(async (finishedProductId: string) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const productBoms = await BOMService.getBOMsForProduct(finishedProductId);
      setBoms(productBoms);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar BOMs del producto';
      setError(errorMessage);
      logger.error('Error loading BOMs for product:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveBOMForProduct = useCallback(async (finishedProductId: string) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const activeBOM = await BOMService.getActiveBOMForProduct(finishedProductId);
      setBom(activeBOM || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar BOM activo';
      setError(errorMessage);
      logger.error('Error loading active BOM:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateBOMItems = useCallback(async (items: BOMItem[]) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const result = await BOMService.validateBOMItems(items);
      setValidationResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar items de BOM';
      setError(errorMessage);
      logger.error('Error validating BOM items:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateProductionFeasibility = useCallback(async (bomId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const feasibility = await BOMService.calculateProductionFeasibility(bomId, quantity);
      setProductionFeasibility(feasibility);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al calcular viabilidad de producción';
      setError(errorMessage);
      logger.error('Error calculating production feasibility:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bom,
    boms,
    loading,
    error,
    validationResult,
    productionFeasibility,
    createBOM,
    updateBOM,
    deactivateBOM,
    getBOMsForProduct,
    getActiveBOMForProduct,
    validateBOMItems,
    calculateProductionFeasibility
  };
}