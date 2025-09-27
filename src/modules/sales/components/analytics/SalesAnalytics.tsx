/**
 * ZADIA OS - Sales Analytics Dashboard
 * 
 * Comprehensive analytics and reports for sales performance
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Download,
  Filter,
  Trophy,
  Clock,
  BarChart3
} from 'lucide-react';

// Mock data for analytics
const MOCK_ANALYTICS_DATA = {
  overview: {
    totalRevenue: 450000,
    revenueGrowth: 15.3,
    totalLeads: 234,
    leadsGrowth: 8.7,
    conversionRate: 23.5,
    conversionGrowth: -2.1,
    averageDealSize: 18500,
    dealSizeGrowth: 12.4,
  },
  monthlyRevenue: [
    { month: 'Ene', revenue: 45000, leads: 28, deals: 8 },
    { month: 'Feb', revenue: 52000, leads: 31, deals: 9 },
    { month: 'Mar', revenue: 48000, leads: 25, deals: 7 },
    { month: 'Abr', revenue: 61000, leads: 35, deals: 11 },
    { month: 'May', revenue: 58000, leads: 29, deals: 10 },
    { month: 'Jun', revenue: 67000, leads: 38, deals: 13 },
  ],
  pipelineByStage: [
    { stage: 'Calificado', count: 15, value: 285000 },
    { stage: 'Propuesta', count: 8, value: 196000 },
    { stage: 'Negociación', count: 5, value: 125000 },
    { stage: 'Cerrado', count: 12, value: 234000 },
  ],
  leadsBySource: [
    { source: 'Web', count: 45, percentage: 32 },
    { source: 'Referidos', count: 38, percentage: 27 },
    { source: 'Eventos', count: 28, percentage: 20 },
    { source: 'Llamadas', count: 18, percentage: 13 },
    { source: 'Importados', count: 11, percentage: 8 },
  ],
  salesperformance: [
    { salesperson: 'Juan Pérez', deals: 15, revenue: 185000, conversion: 28 },
    { salesperson: 'María García', deals: 12, revenue: 156000, conversion: 24 },
    { salesperson: 'Carlos López', deals: 9, revenue: 134000, conversion: 21 },
    { salesperson: 'Ana Martínez', deals: 8, revenue: 98000, conversion: 19 },
  ],
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');

  const { overview } = MOCK_ANALYTICS_DATA;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics de Ventas</h1>
          <p className="text-muted-foreground">
            Métricas y reportes de performance de ventas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mes</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
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
              {getTrendIcon(overview.revenueGrowth)}
              <span className={getTrendColor(overview.revenueGrowth)}>
                {formatPercentage(overview.revenueGrowth)}
              </span>
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
            <div className="text-2xl font-bold">{overview.totalLeads}</div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(overview.leadsGrowth)}
              <span className={getTrendColor(overview.leadsGrowth)}>
                {formatPercentage(overview.leadsGrowth)}
              </span>
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
              {getTrendIcon(overview.conversionGrowth)}
              <span className={getTrendColor(overview.conversionGrowth)}>
                {formatPercentage(overview.conversionGrowth)}
              </span>
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
              {formatCurrency(overview.averageDealSize)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(overview.dealSizeGrowth)}
              <span className={getTrendColor(overview.dealSizeGrowth)}>
                {formatPercentage(overview.dealSizeGrowth)}
              </span>
              <span className="text-muted-foreground">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencia de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={MOCK_ANALYTICS_DATA.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Ingresos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Deals Closed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Deals Cerrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={MOCK_ANALYTICS_DATA.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deals" fill="#82ca9d" name="Deals Cerrados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline by Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pipeline por Etapa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={MOCK_ANALYTICS_DATA.pipelineByStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Valor Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pipeline Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_ANALYTICS_DATA.pipelineByStage.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <div>
                          <p className="font-medium">{stage.stage}</p>
                          <p className="text-sm text-muted-foreground">
                            {stage.count} oportunidades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(stage.value)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(stage.value / stage.count)} promedio
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Fuentes de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={MOCK_ANALYTICS_DATA.leadsBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {MOCK_ANALYTICS_DATA.leadsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sources Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle por Fuente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ANALYTICS_DATA.leadsBySource.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{source.count} leads</Badge>
                        <span className="font-medium">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ANALYTICS_DATA.salesperformance.map((person, index) => (
                  <div key={person.salesperson} className="p-4 rounded border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{person.salesperson}</h4>
                      <Badge variant="outline">
                        Top {index + 1}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Deals Cerrados</p>
                        <p className="font-medium text-lg">{person.deals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ingresos</p>
                        <p className="font-medium text-lg">{formatCurrency(person.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversión</p>
                        <p className="font-medium text-lg">{person.conversion}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}