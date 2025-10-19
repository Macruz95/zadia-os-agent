'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/modules/dashboard/hooks/use-dashboard-data';
import {
  DashboardStatsCards,
  DashboardSecondaryStats,
  RevenueChart,
  ProjectStatusChart,
  MetricsBarChart,
  DashboardLoading,
} from '@/modules/dashboard/components';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, projectStatus, loading } = useDashboardData(user?.uid);

  const [monthlyRevenue] = useState<MonthlyRevenue[]>([
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Abr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ]);

  if (authLoading || loading) {
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
