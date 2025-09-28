import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Target, BarChart3 } from 'lucide-react';
import { formatCurrency } from './AnalyticsConstants';

interface KPIsOverviewProps {
  overview: {
    totalRevenue: number;
    totalDeals: number;
    conversionRate: number;
    avgDealSize: number;
  };
}

export function KPIsOverview({ overview }: KPIsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ingresos Totales
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">vs periodo anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Leads
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalDeals}</div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">vs periodo anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasa de Conversión
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.conversionRate}%</div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">vs periodo anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Deal Size Promedio
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.avgDealSize)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">vs periodo anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}