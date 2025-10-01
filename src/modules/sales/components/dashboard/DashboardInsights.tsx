import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  AlertTriangle, 
  Trophy, 
  ArrowRight, 
  Clock, 
  Zap,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SalesAnalyticsData } from '../../services/analytics.service';
import { OpportunitiesService } from '../../services/opportunities.service';
import { LeadsService } from '../../services/leads.service';
import { Opportunity, Lead } from '../../types/sales.types';

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
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([]);
  const [highPriorityLeads, setHighPriorityLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const { salesPerformance } = analyticsData;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent won opportunities (last 30 days)
        try {
          const opportunities = await OpportunitiesService.getOpportunities();
          const recentWins = opportunities
            .filter(opp => opp.status === 'won' && opp.closedAt)
            .sort((a, b) => (b.closedAt?.seconds || 0) - (a.closedAt?.seconds || 0))
            .slice(0, 3);
          
          setRecentOpportunities(recentWins);
        } catch (oppError) {
          console.warn('Could not fetch opportunities', oppError);
          setRecentOpportunities([]);
        }

        // Fetch leads with simple query to avoid index requirements
        try {
          // Use simple query without multiple filters to avoid index issues
          const leadsResult = await LeadsService.searchLeads({}, 20);
          
          // Filter for high priority leads that need follow-up locally
          const urgentLeads = leadsResult.leads
            .filter(lead => 
              lead.priority === 'hot' && 
              ['new', 'contacted', 'qualifying'].includes(lead.status)
            )
            .slice(0, 5);
          
          setHighPriorityLeads(urgentLeads);
        } catch (leadsError) {
          console.warn('Could not fetch leads, using empty state', leadsError);
          setHighPriorityLeads([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'destructive';
      case 'warm': return 'secondary';
      default: return 'outline';
    }
  };

  const getTimeAgo = (date: Date | { seconds: number } | undefined): string => {
    if (!date) return 'Fecha no disponible';
    
    const dateObj = date instanceof Date ? date : new Date(date.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  // Use real performance data or show empty state
  const topPerformers = salesPerformance.length > 0 
    ? salesPerformance.slice(0, 3)
    : [];

  const urgentItems = highPriorityLeads.map(lead => ({
    id: lead.id,
    title: `Seguimiento ${lead.fullName || lead.entityName || 'Lead'}`,
    subtitle: lead.company || lead.email,
    priority: lead.priority,
    date: lead.updatedAt || lead.createdAt,
  }));

  const recentWins = recentOpportunities.map(opp => ({
    id: opp.id,
    client: opp.name,
    amount: opp.estimatedValue,
    date: getTimeAgo(opp.closedAt),
  }));

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
            {topPerformers.length > 0 ? (
              topPerformers.map((performer, index) => (
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
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay datos de performance disponibles
              </div>
            )}
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
            {loading ? (
              <div className="text-center text-muted-foreground text-sm py-4">
                Cargando items urgentes...
              </div>
            ) : urgentItems.length > 0 ? (
              urgentItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle} • {getTimeAgo(item.date)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay items urgentes
              </div>
            )}
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
            {recentWins.length > 0 ? (
              recentWins.map((win, index) => (
                <div key={win.id || index} className="flex items-center justify-between">
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
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay victorias recientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}