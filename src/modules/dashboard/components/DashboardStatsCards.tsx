/**
 * ZADIA OS - Dashboard Stats Cards
 * Tarjetas de estadísticas principales con sparklines y colores dinámicos
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency.utils';
import { useAuth } from '@/contexts/AuthContext';
import { useKPITrends } from '../hooks/use-kpi-trends';
import { KPISparkline } from './KPISparkline';
import { getHexColor, getKPIColorStatus, getBorderColorClass } from '../utils/dynamic-colors.utils';
import type { DashboardStats } from '../hooks/use-dashboard-data';
import type { KPIThreshold } from '../types/kpi-thresholds.types';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

// Default thresholds (can be moved to user config later)
const DEFAULT_THRESHOLDS: Record<string, KPIThreshold> = {
  leads: {
    kpiName: 'leads',
    excellent: 30,
    good: 15,
    warning: 5,
    isPercentage: false,
    isInverted: false,
  },
  clients: {
    kpiName: 'clients',
    excellent: 50,
    good: 25,
    warning: 10,
    isPercentage: false,
    isInverted: false,
  },
  projects: {
    kpiName: 'projects',
    excellent: 20,
    good: 10,
    warning: 3,
    isPercentage: false,
    isInverted: false,
  },
  revenue: {
    kpiName: 'revenue',
    excellent: 100000,
    good: 50000,
    warning: 10000,
    isPercentage: false,
    isInverted: false,
  },
};

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const { user } = useAuth();

  // Fetch trend data for each KPI
  const leadsTrend = useKPITrends('leads', 'status', user?.uid, 30);
  const clientsTrend = useKPITrends('clients', 'createdAt', user?.uid, 30);
  const projectsTrend = useKPITrends('projects', 'status', user?.uid, 30);
  const revenueTrend = useKPITrends('invoices', 'total', user?.uid, 30);

  // Calculate color status
  const leadsStatus = getKPIColorStatus(stats.totalLeads, DEFAULT_THRESHOLDS.leads);
  const clientsStatus = getKPIColorStatus(stats.totalClients, DEFAULT_THRESHOLDS.clients);
  const projectsStatus = getKPIColorStatus(stats.activeProjects, DEFAULT_THRESHOLDS.projects);
  const revenueStatus = getKPIColorStatus(stats.totalRevenue, DEFAULT_THRESHOLDS.revenue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Leads Card */}
      <Card className={`border-2 ${getBorderColorClass(leadsStatus)}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{stats.totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            {stats.conversionRate}% tasa de conversión
          </p>
          <KPISparkline
            data={leadsTrend.data}
            color={getHexColor(leadsStatus)}
            direction={leadsTrend.direction}
            changePercentage={leadsTrend.changePercentage}
          />
        </CardContent>
      </Card>

      {/* Clients Card */}
      <Card className={`border-2 ${getBorderColorClass(clientsStatus)}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">Cartera total</p>
          <KPISparkline
            data={clientsTrend.data}
            color={getHexColor(clientsStatus)}
            direction={clientsTrend.direction}
            changePercentage={clientsTrend.changePercentage}
          />
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card className={`border-2 ${getBorderColorClass(projectsStatus)}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Proyectos Activos
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">En ejecución</p>
          <KPISparkline
            data={projectsTrend.data}
            color={getHexColor(projectsStatus)}
            direction={projectsTrend.direction}
            changePercentage={projectsTrend.changePercentage}
          />
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className={`border-2 ${getBorderColorClass(revenueStatus)}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <KPISparkline
            data={revenueTrend.data}
            color={getHexColor(revenueStatus)}
            direction={revenueTrend.direction}
            changePercentage={revenueTrend.changePercentage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
