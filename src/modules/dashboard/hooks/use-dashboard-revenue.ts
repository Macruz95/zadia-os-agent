/**
 * ZADIA OS - Use Dashboard Revenue Hook
 * Hook para obtener datos de ingresos del dashboard
 * Rule #4: Clean code with proper error handling
 */

import { useState, useEffect } from 'react';
import { DashboardRevenueService, type DashboardRevenueData, type MonthlyRevenue } from '../services/dashboard-revenue.service';
import { logger } from '@/lib/logger';

interface UseDashboardRevenueState {
  data: DashboardRevenueData | null;
  monthlyRevenue: MonthlyRevenue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardRevenue(monthsBack = 6): UseDashboardRevenueState {
  const [data, setData] = useState<DashboardRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching dashboard revenue data via hook');

      const revenueData = await DashboardRevenueService.getMonthlyRevenueData(monthsBack);
      
      setData(revenueData);
      logger.info('Dashboard revenue data loaded successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar datos de ingresos';
      setError(errorMessage);
      logger.error('Error in useDashboardRevenue hook:', err as Error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [monthsBack]);

  return {
    data,
    monthlyRevenue: data?.monthlyRevenue || [],
    loading,
    error,
    refetch: fetchRevenueData
  };
}