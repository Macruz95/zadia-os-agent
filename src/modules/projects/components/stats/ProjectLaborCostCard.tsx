'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import { LaborCostService } from '@/modules/hr/services/labor-cost.service';
import type { ProjectLaborCost } from '@/modules/hr/services/labor-cost.service';

/**
 * ProjectLaborCostCard Component
 * Displays real-time labor costs calculated from work sessions
 * 
 * Rule #1: Real data from workSessions collection via LaborCostService
 * Rule #2: ShadCN UI Card + Lucide icons (Clock, DollarSign, TrendingUp)
 * Rule #4: Modular component separated from ProjectOverview
 * Rule #5: 157 lines
 */

interface ProjectLaborCostCardProps {
  projectId: string;
}

export function ProjectLaborCostCard({ projectId }: ProjectLaborCostCardProps) {
  const [laborCost, setLaborCost] = useState<ProjectLaborCost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaborCost() {
      try {
        setLoading(true);
        const cost = await LaborCostService.calculateProjectCost(projectId);
        setLaborCost(cost);
      } catch {
        // Silently fail - show 0 costs
        setLaborCost({
          projectId,
          totalHours: 0,
          totalCost: 0,
          billableHours: 0,
          billableCost: 0,
          nonBillableHours: 0,
          nonBillableCost: 0,
          sessionsCount: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLaborCost();
  }, [projectId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costos Laborales Reales</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!laborCost || laborCost.sessionsCount === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costos Laborales Reales</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No hay sesiones de trabajo registradas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Los empleados pueden registrar tiempo en sus perfiles
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const billablePercentage = laborCost.totalHours > 0
    ? (laborCost.billableHours / laborCost.totalHours) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Costos Laborales Reales</CardTitle>
          <CardDescription className="mt-1">
            {laborCost.sessionsCount} sesiones de trabajo completadas
          </CardDescription>
        </div>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Cost */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Costo Total</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(laborCost.totalCost)}
          </span>
        </div>

        {/* Total Hours */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Horas Totales</span>
          </div>
          <span className="text-lg font-semibold">
            {formatHours(laborCost.totalHours)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t pt-3 space-y-2">
          {/* Billable */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">Facturable</Badge>
              <span className="text-xs text-muted-foreground">
                {formatHours(laborCost.billableHours)}
              </span>
            </div>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(laborCost.billableCost)}
            </span>
          </div>

          {/* Non-Billable */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">No Facturable</Badge>
              <span className="text-xs text-muted-foreground">
                {formatHours(laborCost.nonBillableHours)}
              </span>
            </div>
            <span className="text-sm font-medium text-orange-600">
              {formatCurrency(laborCost.nonBillableCost)}
            </span>
          </div>

          {/* Billable Percentage */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">% Facturable</span>
            <Badge variant={billablePercentage >= 80 ? 'default' : 'secondary'}>
              {billablePercentage.toFixed(0)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
