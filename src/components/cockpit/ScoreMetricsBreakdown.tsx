/**
 * ZADIA Score™ - Desglose de Métricas
 * 
 * Muestra el breakdown de las 5 métricas que componen el score
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 120 líneas
 */

'use client';

import {
  DollarSign,
  Droplets,
  Gauge,
  Heart,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreMetrics {
  profitability: number;
  liquidity: number;
  operationalEfficiency: number;
  customerSatisfaction: number;
  salesGrowth: number;
}

interface ScoreMetricsBreakdownProps {
  metrics: ScoreMetrics;
  loading?: boolean;
}

const METRIC_CONFIG = [
  {
    key: 'profitability',
    label: 'Rentabilidad',
    icon: DollarSign,
    weight: '25%',
    color: 'bg-emerald-500'
  },
  {
    key: 'liquidity',
    label: 'Liquidez',
    icon: Droplets,
    weight: '20%',
    color: 'bg-blue-500'
  },
  {
    key: 'operationalEfficiency',
    label: 'Eficiencia Op.',
    icon: Gauge,
    weight: '20%',
    color: 'bg-purple-500'
  },
  {
    key: 'customerSatisfaction',
    label: 'Satisfacción',
    icon: Heart,
    weight: '15%',
    color: 'bg-pink-500'
  },
  {
    key: 'salesGrowth',
    label: 'Crecimiento',
    icon: TrendingUp,
    weight: '20%',
    color: 'bg-cyan-500'
  },
] as const;

export function ScoreMetricsBreakdown({ metrics, loading }: ScoreMetricsBreakdownProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {METRIC_CONFIG.map((config) => (
          <div key={config.key} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {METRIC_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = metrics[config.key];

        return (
          <div key={config.key} className="group">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "bg-muted group-hover:bg-muted/80 transition-colors"
              )}>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Label & Value */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground truncate">
                    {config.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/70">{config.weight}</span>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {Math.round(value)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      config.color
                    )}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

