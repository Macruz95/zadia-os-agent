import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  AlertTriangle, 
  Trophy, 
  ArrowRight, 
  Clock, 
  Zap 
} from 'lucide-react';
import type { SalesAnalyticsData } from '../../services/analytics.service';

interface DashboardInsightsProps {
  analyticsData: SalesAnalyticsData;
  onViewAnalytics: () => void;
  onGoToSales: () => void;
  onViewPipeline: () => void;
}

export function DashboardInsights({ 
  analyticsData, 
  onViewAnalytics, 
  onGoToSales, 
  onViewPipeline 
}: DashboardInsightsProps) {
  const { overview } = analyticsData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  // Generate sample data based on real analytics
  const topPerformers = [
    { 
      name: 'Vendedor Principal', 
      deals: overview.totalDeals, 
      revenue: overview.totalRevenue * 0.4 
    },
    { 
      name: 'Gerente de Ventas', 
      deals: Math.floor(overview.totalDeals * 0.3), 
      revenue: overview.totalRevenue * 0.3 
    },
    { 
      name: 'Ejecutivo Senior', 
      deals: Math.floor(overview.totalDeals * 0.2), 
      revenue: overview.totalRevenue * 0.2 
    },
  ];

  const urgentItems = [
    { title: 'Seguimiento propuesta ABC Corp', priority: 'high', days: 3 },
    { title: 'Renovación contrato XYZ Ltd', priority: 'medium', days: 1 },
    { title: 'Llamada prospecto Tech Solutions', priority: 'medium', days: 2 },
  ];

  const recentWins = [
    { client: 'TechCorp S.A.', amount: overview.totalRevenue * 0.3, date: 'Hace 2 días' },
    { client: 'InnovaSoft Ltd.', amount: overview.totalRevenue * 0.2, date: 'Hace 5 días' },
    { client: 'Digital Solutions', amount: overview.totalRevenue * 0.15, date: 'Hace 1 semana' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Performers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAnalytics}
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {performer.deals} deals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatCurrency(performer.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Urgent Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Items Urgentes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onGoToSales}
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {urgentItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Hace {item.days} {item.days === 1 ? 'día' : 'días'}
                    </p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Wins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Victorias Recientes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewPipeline}
          >
            Ver pipeline
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWins.map((win, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{win.client}</p>
                    <p className="text-xs text-muted-foreground">{win.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-green-600">
                    {formatCurrency(win.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}