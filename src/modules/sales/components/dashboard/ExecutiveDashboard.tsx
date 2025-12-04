/**
 * ZADIA OS - Executive Sales Dashboard
 * 
 * High-level executive summary of sales performance
 */

'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKPICards } from './DashboardKPICards';
import { DashboardGoalsProgress } from './DashboardGoalsProgress';
import { DashboardInsights } from './DashboardInsights';
import { SalesAnalyticsService } from '../../services/analytics.service';
import type { SalesAnalyticsData } from '../../services/analytics.service';
import { toast } from 'sonner';
import { useTenantId } from '@/contexts/TenantContext';

export function ExecutiveDashboard() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [analyticsData, setAnalyticsData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      try {
        const data = await SalesAnalyticsService.getSalesAnalytics(tenantId);
        setAnalyticsData(data);
      } catch (error) {
        logger.error('Error loading executive dashboard data', error as Error, {
          component: 'ExecutiveDashboard',
          action: 'fetchData'
        });
        toast.error('Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader 
        onViewAnalytics={() => router.push('/sales/analytics')}
        onGoToSales={() => router.push('/sales/leads')}
      />
      
      <DashboardKPICards analyticsData={analyticsData} />
      
      <DashboardGoalsProgress analyticsData={analyticsData} />
      
      <DashboardInsights 
        analyticsData={analyticsData}
        onViewAnalytics={() => router.push('/sales/analytics')}
        onGoToSales={() => router.push('/sales')}
        onViewPipeline={() => router.push('/sales/opportunities')}
      />
    </div>
  );
}