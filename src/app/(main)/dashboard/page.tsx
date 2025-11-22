'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import { useDashboardRevenue } from '@/modules/dashboard/hooks/use-dashboard-revenue';
import { useAIDashboardInsights } from '@/modules/dashboard/hooks/use-ai-dashboard-insights';
import { useDashboardMetrics } from '@/modules/dashboard/hooks/useDashboardMetrics';
import {
  DashboardStatsCards,
  DashboardSecondaryStats,
  RevenueChart,
  ProjectStatusChart,
  MetricsBarChart,
  DashboardLoading,
  FinancialPulseWidget,
  PriorityActionsWidget,
} from '@/modules/dashboard/components';
import { AIInsightsPanel } from '@/modules/dashboard/components/AIInsightsPanel';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(user?.uid);
  const { data: revenueData, monthlyRevenue, loading: revenueLoading } = useDashboardRevenue(6);
  const { metrics, loading: metricsLoading } = useDashboardMetrics();

  // AI Insights
  const aiInsights = useAIDashboardInsights(
    revenueData?.totalRevenue || 0,
    metrics?.financial?.monthlyExpenses || 0,
    metrics?.financial?.netProfit || 0,
    monthlyRevenue,
    stats?.pendingInvoices,
    stats?.activeOpportunities
  );

  if (authLoading || loading || revenueLoading || metricsLoading) {
    return <DashboardLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Dashboard Ejecutivo
        </h1>
        <p className='text-muted-foreground'>
          Bienvenido, {user.displayName || user.email?.split('@')[0] || 'Usuario'}
        </p>
      </div>

      {/* Financial Pulse - Top Priority */}
      <FinancialPulseWidget metrics={metrics?.financial} loading={metricsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Actions - Critical for CEO */}
        <div className="lg:col-span-1 h-full">
          <PriorityActionsWidget actions={metrics?.priorityActions || []} loading={metricsLoading} />
        </div>

        {/* Revenue Chart - Main Visual */}
        <div className="lg:col-span-2 h-full">
          <RevenueChart data={monthlyRevenue} />
        </div>
      </div>

      {/* Operational & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectStatusChart data={projectStatus} />
        <AIInsightsPanel
          insights={aiInsights.insights}
          healthScore={aiInsights.healthScore}
          loading={aiInsights.loading}
          error={aiInsights.error}
        />
      </div>

      {/* Secondary Stats - Less critical info */}
      <DashboardStatsCards stats={stats} />
    </div>
  );
}
