/**
 * ZADIA OS - Use Dashboard Revenue Hook
 * Hook para obtener datos de ingresos del dashboard
 * Rule #4: Clean code with proper error handling
 */

import { useState, useEffect } from 'react';
import { DashboardRevenueService, type DashboardRevenueData, type MonthlyRevenue } from '../services/dashboard-revenue.service';
import { useTenantId, useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';

interface UseDashboardRevenueState {
  data: DashboardRevenueData | null;
  monthlyRevenue: MonthlyRevenue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EMPTY_DATA: DashboardRevenueData = {
  monthlyRevenue: [],
  totalRevenue: 0,
  averageMonthlyRevenue: 0,
  monthlyGrowth: 0
};

export function useDashboardRevenue(monthsBack = 6): UseDashboardRevenueState {
  const tenantId = useTenantId();
  const { loading: tenantLoading } = useTenant();
  const [data, setData] = useState<DashboardRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    // If no tenantId, return empty data
    if (!tenantId) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching dashboard revenue data via hook');

      const revenueData = await DashboardRevenueService.getMonthlyRevenueData(monthsBack, tenantId);
      
      setData(revenueData);
      logger.info('Dashboard revenue data loaded successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar datos de ingresos';
      setError(errorMessage);
      logger.error('Error in useDashboardRevenue hook:', err as Error);
      setData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for tenant context to finish loading
    if (tenantLoading) {
      return;
    }

    // If no tenantId after loading, set empty data
    if (!tenantId) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    fetchRevenueData();
  }, [monthsBack, tenantId, tenantLoading]);

  return {
    data,
    monthlyRevenue: data?.monthlyRevenue || [],
    loading,
    error,
    refetch: fetchRevenueData
  };
}