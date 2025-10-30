'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import { useDashboardRevenue } from '@/modules/dashboard/hooks/use-dashboard-revenue';
import { useAIDashboardInsights } from '@/modules/dashboard/hooks/use-ai-dashboard-insights';
import {
  DashboardStatsCards,
  DashboardSecondaryStats,
  RevenueChart,
  ProjectStatusChart,
  MetricsBarChart,
  DashboardLoading,
} from '@/modules/dashboard/components';
import { AIInsightsPanel } from '@/modules/dashboard/components/AIInsightsPanel';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(user?.uid);
  const { data: revenueData, monthlyRevenue, loading: revenueLoading } = useDashboardRevenue(6);

  // AI Insights
  const aiInsights = useAIDashboardInsights(
    revenueData?.totalRevenue || 0,
    0, // TODO: Get expenses from stats
    revenueData?.totalRevenue || 0, // TODO: Calculate profit
    monthlyRevenue,
    stats?.pendingInvoices,
    stats?.activeOpportunities
  );

  if (authLoading || loading || revenueLoading) {
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

      <DashboardStatsCards stats={stats} />
      <DashboardSecondaryStats stats={stats} />

      {/* AI Insights Panel */}
      <AIInsightsPanel
        insights={aiInsights.insights}
        healthScore={aiInsights.healthScore}
        loading={aiInsights.loading}
        error={aiInsights.error}
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <RevenueChart data={monthlyRevenue} />
        <ProjectStatusChart data={projectStatus} />
      </div>

      <MetricsBarChart stats={stats} />
    </div>
  );
}
