'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import { useDashboardRevenue } from '@/modules/dashboard/hooks/use-dashboard-revenue';
import {
  DashboardStatsCards,
  DashboardSecondaryStats,
  RevenueChart,
  ProjectStatusChart,
  MetricsBarChart,
  DashboardLoading,
} from '@/modules/dashboard/components';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(user?.uid);
  const { monthlyRevenue, loading: revenueLoading } = useDashboardRevenue(6);

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

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <RevenueChart data={monthlyRevenue} />
        <ProjectStatusChart data={projectStatus} />
      </div>

      <MetricsBarChart stats={stats} />
    </div>
  );
}
