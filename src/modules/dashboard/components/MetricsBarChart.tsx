/**
 * ZADIA OS - Metrics Bar Chart
 * Gráfico de barras con métricas clave
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardStats } from '../hooks/use-dashboard-data';

interface MetricsBarChartProps {
  stats: DashboardStats;
}

export function MetricsBarChart({ stats }: MetricsBarChartProps) {
  const chartData = [
    { name: 'Leads', value: stats.totalLeads },
    { name: 'Clientes', value: stats.totalClients },
    { name: 'Proyectos', value: stats.activeProjects },
    { name: 'Oportunidades', value: stats.activeOpportunities },
    { name: 'Work Orders', value: stats.workOrdersInProgress },
    { name: 'Facturas', value: stats.pendingInvoices },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Clave</CardTitle>
        <CardDescription>
          Comparación de indicadores principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
