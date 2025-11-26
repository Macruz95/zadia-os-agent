/**
 * ZADIA OS - Sales Analytics Dashboard
 * 
 * Comprehensive analytics and reports for sales performance
 */

'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesAnalyticsService } from '../../services/analytics.service';
import type { SalesAnalyticsData } from '../../services/analytics.service';
import { toast } from 'sonner';

import { AnalyticsHeader } from './AnalyticsHeader';
import { KPIsOverview } from './KPIsOverview';
import { PerformanceTab } from './PerformanceTab';
import { PipelineTab } from './PipelineTab';
import { SourcesTab } from './SourcesTab';
import { TeamTab } from './TeamTab';

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [analyticsData, setAnalyticsData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await SalesAnalyticsService.getSalesAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        logger.error('Error loading sales analytics', error as Error, {
          component: 'SalesAnalytics',
          action: 'fetchAnalytics'
        });
        toast.error('Error al cargar analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const { overview, monthlyRevenue, pipelineStages, leadSources, salesPerformance } = analyticsData;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <KPIsOverview overview={overview} />

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceTab monthlyRevenue={monthlyRevenue} />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineTab pipelineByStage={pipelineStages} />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <SourcesTab leadsBySource={leadSources} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTab salesPerformance={salesPerformance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}