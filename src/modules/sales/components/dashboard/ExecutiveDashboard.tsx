/**
 * ZADIA OS - Executive Sales Dashboard
 * 
 * High-level executive summary of sales performance
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Trophy,
  Clock,
  AlertTriangle,
  Calendar,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock executive data
const EXECUTIVE_DATA = {
  currentMonth: {
    revenue: 67000,
    target: 75000,
    deals: 13,
    leads: 38,
    conversion: 34.2,
  },
  quarterlyGoals: {
    revenue: { current: 186000, target: 225000 },
    newClients: { current: 28, target: 35 },
    pipelineValue: { current: 450000, target: 500000 },
  },
  topPerformers: [
    { name: 'Juan Pérez', deals: 15, revenue: 185000 },
    { name: 'María García', deals: 12, revenue: 156000 },
    { name: 'Carlos López', deals: 9, revenue: 134000 },
  ],
  urgentItems: [
    { type: 'quote', title: 'Cotización ERP - Empresa ABC', days: 2, priority: 'high' },
    { type: 'opportunity', title: 'Negociación Tech Corp', days: 5, priority: 'medium' },
    { type: 'lead', title: '8 leads sin contactar', days: 1, priority: 'high' },
  ],
  recentWins: [
    { client: 'Startup XYZ', amount: 15000, date: '2024-01-28' },
    { client: 'Manufacturing Corp', amount: 28000, date: '2024-01-25' },
    { client: 'Tech Solutions', amount: 12000, date: '2024-01-22' },
  ],
};

export function ExecutiveDashboard() {
  const router = useRouter();
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">
            Resumen ejecutivo de performance de ventas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/sales/analytics')}>
            Ver Analytics Completo
          </Button>
          <Button onClick={() => router.push('/sales/leads')}>
            Ir a Ventas
          </Button>
        </div>
      </div>

      {/* Current Month Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Este Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(EXECUTIVE_DATA.currentMonth.revenue)}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Meta: {formatCurrency(EXECUTIVE_DATA.currentMonth.target)}</span>
                <span>{Math.round((EXECUTIVE_DATA.currentMonth.revenue / EXECUTIVE_DATA.currentMonth.target) * 100)}%</span>
              </div>
              <Progress 
                value={(EXECUTIVE_DATA.currentMonth.revenue / EXECUTIVE_DATA.currentMonth.target) * 100} 
                className="h-2"
              />
            </div>
            <div className="flex items-center gap-1 text-xs mt-2">
              {EXECUTIVE_DATA.currentMonth.revenue >= EXECUTIVE_DATA.currentMonth.target * 0.9 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className="text-muted-foreground">
                vs meta mensual
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Deals Cerrados
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{EXECUTIVE_DATA.currentMonth.deals}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{EXECUTIVE_DATA.currentMonth.leads}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversión
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{EXECUTIVE_DATA.currentMonth.conversion}%</div>
            <p className="text-xs text-muted-foreground">
              Lead → Deal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Goals */}
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
                  {Math.round((EXECUTIVE_DATA.quarterlyGoals.revenue.current / EXECUTIVE_DATA.quarterlyGoals.revenue.target) * 100)}%
                </span>
              </div>
              <Progress 
                value={(EXECUTIVE_DATA.quarterlyGoals.revenue.current / EXECUTIVE_DATA.quarterlyGoals.revenue.target) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(EXECUTIVE_DATA.quarterlyGoals.revenue.current)}</span>
                <span>{formatCurrency(EXECUTIVE_DATA.quarterlyGoals.revenue.target)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nuevos Clientes</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round((EXECUTIVE_DATA.quarterlyGoals.newClients.current / EXECUTIVE_DATA.quarterlyGoals.newClients.target) * 100)}%
                </span>
              </div>
              <Progress 
                value={(EXECUTIVE_DATA.quarterlyGoals.newClients.current / EXECUTIVE_DATA.quarterlyGoals.newClients.target) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{EXECUTIVE_DATA.quarterlyGoals.newClients.current}</span>
                <span>{EXECUTIVE_DATA.quarterlyGoals.newClients.target}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor Pipeline</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round((EXECUTIVE_DATA.quarterlyGoals.pipelineValue.current / EXECUTIVE_DATA.quarterlyGoals.pipelineValue.target) * 100)}%
                </span>
              </div>
              <Progress 
                value={(EXECUTIVE_DATA.quarterlyGoals.pipelineValue.current / EXECUTIVE_DATA.quarterlyGoals.pipelineValue.target) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(EXECUTIVE_DATA.quarterlyGoals.pipelineValue.current)}</span>
                <span>{formatCurrency(EXECUTIVE_DATA.quarterlyGoals.pipelineValue.target)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
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
              onClick={() => router.push('/sales/analytics')}
            >
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXECUTIVE_DATA.topPerformers.map((performer, index) => (
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
              onClick={() => router.push('/sales')}
            >
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXECUTIVE_DATA.urgentItems.map((item, index) => (
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
              onClick={() => router.push('/sales/opportunities')}
            >
              Ver pipeline
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXECUTIVE_DATA.recentWins.map((win, index) => (
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
    </div>
  );
}