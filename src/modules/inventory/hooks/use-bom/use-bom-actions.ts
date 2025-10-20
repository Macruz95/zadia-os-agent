/**
 * ZADIA OS - Use BOM Actions Hook
 * Acciones de gestión de BOM
 * Rule #5: Max 200 lines per file
 */

import { useCallback } from 'react';
import type { BillOfMaterials, BOMItem } from '../../types/inventory.types';
import { BOMService } from '../../services/entities/bom.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import type { UseBOMActions, BOMValidationResult, ProductionFeasibility } from './types';

interface UseBOMActionsParams {
  setBom: (bom: BillOfMaterials | undefined) => void;
  setBoms: (boms: BillOfMaterials[] | ((prev: BillOfMaterials[]) => BillOfMaterials[])) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setValidationResult: (result: BOMValidationResult | undefined) => void;
  setProductionFeasibility: (result: ProductionFeasibility | undefined) => void;
  bom?: BillOfMaterials;
}

/**
 * Hook para manejar las acciones del BOM
 */
export function useBOMActions(params: UseBOMActionsParams): UseBOMActions {
  const {
    setBom,
    setBoms,
    setLoading,
    setError,
    setValidationResult,
    setProductionFeasibility,
    bom,
  } = params;

  const { user } = useAuth();

  const createBOM = useCallback(
    async (
      bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
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
          const updatedBoms = await BOMService.getBOMsForProduct(
            bomData.finishedProductId
          );
          setBoms(updatedBoms);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al crear BOM';
        setError(errorMessage);
        logger.error('Error creating BOM:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [user, setBom, setBoms, setLoading, setError]
  );

  const updateBOM = useCallback(
    async (
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

        await BOMService.updateBOM(id, bomData);

        // Refresh current BOM
        const updatedBOM = await BOMService.getBOMById(id);
        if (updatedBOM) {
          setBom(updatedBOM);

          // Update in BOMs list
          setBoms((prev) => prev.map((b) => (b.id === id ? updatedBOM : b)));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al actualizar BOM';
        setError(errorMessage);
        logger.error('Error updating BOM:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [user, setBom, setBoms, setLoading, setError]
  );

  const deactivateBOM = useCallback(
    async (id: string) => {
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      try {
        setLoading(true);
        setError(undefined);

        await BOMService.deactivateBOM(id);

        // Remove from current state
        setBoms((prev) => prev.filter((b) => b.id !== id));
        if (bom?.id === id) {
          setBom(undefined);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al desactivar BOM';
        setError(errorMessage);
        logger.error('Error deactivating BOM:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [user, bom, setBom, setBoms, setLoading, setError]
  );

  const getBOMsForProduct = useCallback(
    async (finishedProductId: string) => {
      try {
        setLoading(true);
        setError(undefined);

        const productBoms = await BOMService.getBOMsForProduct(finishedProductId);
        setBoms(productBoms);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al cargar BOMs del producto';
        setError(errorMessage);
        logger.error('Error loading BOMs for product:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [setBoms, setLoading, setError]
  );

  const getActiveBOMForProduct = useCallback(
    async (finishedProductId: string) => {
      try {
        setLoading(true);
        setError(undefined);

        const activeBOM = await BOMService.getActiveBOMForProduct(
          finishedProductId
        );
        setBom(activeBOM || undefined);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar BOM activo';
        setError(errorMessage);
        logger.error('Error loading active BOM:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [setBom, setLoading, setError]
  );

  const validateBOMItems = useCallback(
    async (items: BOMItem[]) => {
      try {
        setLoading(true);
        setError(undefined);

        const result = await BOMService.validateBOMItems(items);
        setValidationResult(result as {
          isValid: boolean;
          errors: string[];
          warnings: string[];
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al validar items de BOM';
        setError(errorMessage);
        logger.error('Error validating BOM items:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setValidationResult]
  );

  const calculateProductionFeasibility = useCallback(
    async (bomId: string, quantity: number) => {
      try {
        setLoading(true);
        setError(undefined);

        const feasibility = await BOMService.calculateProductionFeasibility(
          bomId,
          quantity
        );
        setProductionFeasibility(feasibility);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al calcular viabilidad de producción';
        setError(errorMessage);
        logger.error('Error calculating production feasibility:', err as Error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setProductionFeasibility]
  );

  return {
    createBOM,
    updateBOM,
    deactivateBOM,
    getBOMsForProduct,
    getActiveBOMForProduct,
    validateBOMItems,
    calculateProductionFeasibility,
  };
}
