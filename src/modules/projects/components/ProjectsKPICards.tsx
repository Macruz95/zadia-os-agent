'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderKanban, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react';

// Rule #2: ShadCN UI + Lucide Icons only

interface ProjectsKPICardsProps {
  kpis: {
    total: number;
    active: number;
    completed: number;
    delayed: number;
    totalRevenue: number;
    totalCost: number;
    profitMargin: number;
    averageProgress: number;
  };
  loading?: boolean;
}

export function ProjectsKPICards({ kpis, loading = false }: ProjectsKPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.total}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.active} activos, {kpis.completed} completados
          </p>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{kpis.active}</div>
          <p className="text-xs text-muted-foreground">
            Progreso promedio: {formatPercent(kpis.averageProgress)}
          </p>
        </CardContent>
      </Card>

      {/* Delayed Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proyectos Retrasados</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{kpis.delayed}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.active > 0 
              ? `${((kpis.delayed / kpis.active) * 100).toFixed(0)}% de activos`
              : 'Sin proyectos activos'}
          </p>
        </CardContent>
      </Card>

      {/* Completed Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completados</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{kpis.completed}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.total > 0 
              ? `${((kpis.completed / kpis.total) * 100).toFixed(0)}% del total`
              : 'Sin proyectos'}
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Ventas totales de proyectos
          </p>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
          <BarChart3 className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalCost)}</div>
          <p className="text-xs text-muted-foreground">
            Costos acumulados
          </p>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
          <TrendingUp className={`h-4 w-4 ${
            kpis.profitMargin > 20 ? 'text-green-600' : 
            kpis.profitMargin > 10 ? 'text-yellow-600' : 
            'text-red-600'
          }`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            kpis.profitMargin > 20 ? 'text-green-600' : 
            kpis.profitMargin > 10 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {formatPercent(kpis.profitMargin)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(kpis.totalRevenue - kpis.totalCost)} de utilidad
          </p>
        </CardContent>
      </Card>

      {/* Average Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(kpis.averageProgress)}</div>
          <p className="text-xs text-muted-foreground">
            De todos los proyectos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
