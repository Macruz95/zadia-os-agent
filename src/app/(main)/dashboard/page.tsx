/**
 * ZADIA OS - CEO Cockpit Dashboard
 * 
 * Centro de mando ejecutivo unificado
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 100 líneas
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import { useDashboardRevenue } from '@/modules/dashboard/hooks/use-dashboard-revenue';
import { useDashboardMetrics } from '@/modules/dashboard/hooks/useDashboardMetrics';
import { RevenueChart, ProjectStatusChart, DashboardLoading } from '@/modules/dashboard/components';
import { ZadiaScoreWidget, DigitalAdvisorWidget, FinancialKPIGrid } from '@/components/cockpit';
import { GlobalActivityFeed } from '@/components/cockpit/GlobalActivityFeed';
import { AgenticSystemStatus } from '@/components/cockpit/AgenticSystemStatus';
import { Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(user?.uid);
  const { data: revenueData, monthlyRevenue, loading: revenueLoading } = useDashboardRevenue(6);
  const { metrics, loading: metricsLoading } = useDashboardMetrics();

  const isLoading = authLoading || loading || revenueLoading || metricsLoading;

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Centro de Mando
            </h1>
            <p className="text-sm text-gray-500">
              Bienvenido, {user.displayName || user.email?.split('@')[0] || 'CEO'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* KPIs Financieros con Sparklines */}
      <FinancialKPIGrid
        revenue={revenueData?.totalRevenue || 0}
        expenses={metrics?.financial?.monthlyExpenses || 0}
        profit={metrics?.financial?.netProfit || 0}
        pendingInvoices={stats?.pendingInvoices || 0}
        revenueHistory={monthlyRevenue?.map(m => m.revenue) || []}
        loading={isLoading}
      />

      {/* ZADIA Score + Consejero Digital */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ZadiaScoreWidget />
        <div className="xl:col-span-2">
          <DigitalAdvisorWidget maxInsights={3} />
        </div>
      </div>

      {/* Gráficos: Ingresos + Estado de Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        <ProjectStatusChart data={projectStatus} />
      </div>

      {/* Sistema Agéntico A-OS - Full Width */}
      <AgenticSystemStatus />

      {/* Actividad Global del Sistema */}
      <GlobalActivityFeed maxEvents={10} />
    </div>
  );
}
