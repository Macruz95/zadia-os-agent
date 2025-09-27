/**
 * ZADIA OS - Use Inventory KPIs Hook
 * 
 * Manages inventory KPIs calculation and state
 */

import { useState, useCallback } from 'react';
import { InventoryKPIs } from '../types/inventory-extended.types';
import { RawMaterial, FinishedProduct } from '../types/inventory.types';
import { InventoryKPIsService } from '../services/entities/inventory-kpis.service';
import { logger } from '@/lib/logger';

interface UseInventoryKPIsReturn {
  kpis?: InventoryKPIs;
  loading: boolean;
  error?: string;
  turnoverData?: {
    rawMaterialsTurnover: number;
    finishedProductsTurnover: number;
    overallTurnover: number;
  };
  categoryData?: {
    rawMaterialsByCategory: Record<string, number>;
    finishedProductsByCategory: Record<string, number>;
  };
  refreshKPIs: (rawMaterials: RawMaterial[], finishedProducts: FinishedProduct[]) => void;
  calculateTurnover: (rawMaterials: RawMaterial[], finishedProducts: FinishedProduct[]) => Promise<void>;
}

export function useInventoryKPIs(): UseInventoryKPIsReturn {
  const [kpis, setKpis] = useState<InventoryKPIs>();
  const [turnoverData, setTurnoverData] = useState<{
    rawMaterialsTurnover: number;
    finishedProductsTurnover: number;
    overallTurnover: number;
  }>();
  const [categoryData, setCategoryData] = useState<{
    rawMaterialsByCategory: Record<string, number>;
    finishedProductsByCategory: Record<string, number>;
  }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refreshKPIs = useCallback((
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ) => {
    try {
      setLoading(true);
      setError(undefined);
      
      logger.info(`Calculating KPIs for ${rawMaterials.length} raw materials and ${finishedProducts.length} finished products`);
      
      // Calculate main KPIs (now synchronous)
      const calculatedKPIs = InventoryKPIsService.calculateInventoryKPIs(
        rawMaterials,
        finishedProducts
      );
      
      logger.info('KPIs calculated successfully');
      
      // Calculate category breakdown
      const categoryBreakdown = InventoryKPIsService.calculateInventoryValueByCategory(
        rawMaterials,
        finishedProducts
      );
      
      setKpis(calculatedKPIs);
      setCategoryData(categoryBreakdown);
      
    } catch (err) {
      console.error('Error in refreshKPIs:', err);
      const errorMessage = 'Error al calcular KPIs de inventario';
      setError(errorMessage);
      logger.error('Error calculating inventory KPIs:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTurnover = useCallback(async (
    rawMaterials: RawMaterial[],
    finishedProducts: FinishedProduct[]
  ) => {
    try {
      const turnover = await InventoryKPIsService.calculateInventoryTurnover(
        rawMaterials,
        finishedProducts
      );
      setTurnoverData(turnover);
    } catch (err) {
      logger.error('Error calculating inventory turnover:', err as Error);
    }
  }, []);

  return {
    kpis,
    loading,
    error,
    turnoverData,
    categoryData,
    refreshKPIs,
    calculateTurnover
  };
}