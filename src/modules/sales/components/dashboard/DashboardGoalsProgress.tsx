import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import type { SalesAnalyticsData } from '../../services/analytics.service';

interface DashboardGoalsProgressProps {
  analyticsData: SalesAnalyticsData;
}

export function DashboardGoalsProgress({ analyticsData }: DashboardGoalsProgressProps) {
  const { overview } = analyticsData;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate quarterly goals based on current data
  const quarterlyRevenue = {
    current: overview.totalRevenue,
    target: overview.totalRevenue * 1.5, // Assuming 50% more as quarterly target
  };
  
  const quarterlyClients = {
    current: overview.totalDeals,
    target: Math.max(overview.totalDeals * 2, 10), // Target double the current deals
  };
  
  const pipelineValue = {
    current: overview.totalRevenue * 0.8, // Assuming 80% of revenue is pipeline
    target: overview.totalRevenue * 2,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Objetivos Trimestrales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ingresos</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((quarterlyRevenue.current / quarterlyRevenue.target) * 100)}%
              </span>
            </div>
            <Progress 
              value={(quarterlyRevenue.current / quarterlyRevenue.target) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(quarterlyRevenue.current)}</span>
              <span>{formatCurrency(quarterlyRevenue.target)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nuevos Clientes</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((quarterlyClients.current / quarterlyClients.target) * 100)}%
              </span>
            </div>
            <Progress 
              value={(quarterlyClients.current / quarterlyClients.target) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{quarterlyClients.current}</span>
              <span>{quarterlyClients.target}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valor Pipeline</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((pipelineValue.current / pipelineValue.target) * 100)}%
              </span>
            </div>
            <Progress 
              value={(pipelineValue.current / pipelineValue.target) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(pipelineValue.current)}</span>
              <span>{formatCurrency(pipelineValue.target)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}