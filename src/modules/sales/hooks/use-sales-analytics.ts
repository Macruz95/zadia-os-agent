/**
 * ZADIA OS - Use Sales Analytics Hook
 * 
 * Manages sales analytics and metrics
 */

import { useState, useCallback } from 'react';
import { SalesPipelineKPIs } from '../types/sales.types';
import { SalesAnalyticsService } from '../services/analytics.service';
import { logger } from '@/lib/logger';

interface UseSalesAnalyticsReturn {
  metrics: SalesPipelineKPIs | null;
  loading: boolean;
  error?: string;
  loadMetrics: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSalesAnalytics(): UseSalesAnalyticsReturn {
  const [metrics, setMetrics] = useState<SalesPipelineKPIs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      // Usar método existente del servicio
      const salesData = await SalesAnalyticsService.getSalesAnalytics();
      
      // Convertir a formato SalesPipelineKPIs usando los datos disponibles
      const salesMetrics: SalesPipelineKPIs = {
        totalLeads: 0, // No disponible en salesData, se puede agregar después
        leadsThisMonth: 0, // No disponible en salesData
        conversionRate: salesData.overview.conversionRate,
        totalOpportunities: salesData.overview.totalDeals,
        openOpportunities: salesData.overview.totalDeals, // Aproximación
        totalPipelineValue: salesData.overview.totalRevenue,
        avgDealSize: salesData.overview.avgDealSize,
        avgSalesCycle: 30, // Valor por defecto, se puede calcular después
        winRate: salesData.overview.conversionRate,
        totalQuotes: 0, // No disponible en salesData
        quotesThisMonth: 0, // No disponible en salesData
        quoteAcceptanceRate: 0 // No disponible en salesData
      };
      
      setMetrics(salesMetrics);
    } catch (err) {
      const errorMessage = 'Error al cargar métricas de ventas';
      setError(errorMessage);
      logger.error('Error loading sales metrics:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
    refresh,
  };
}