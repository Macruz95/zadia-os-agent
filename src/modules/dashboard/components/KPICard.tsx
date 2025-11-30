'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIValue } from '../types/analytics.types';

interface KPICardProps {
  title: string;
  value: KPIValue;
  format?: 'number' | 'currency' | 'percent';
  currency?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Formats a number based on the specified format type
 */
function formatValue(
  value: number,
  format: 'number' | 'currency' | 'percent',
  currency: string = 'USD'
): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('es-MX').format(value);
  }
}

/**
 * KPI Card component for displaying key metrics with trend indicators
 */
export function KPICard({
  title,
  value,
  format = 'number',
  currency = 'USD',
  icon,
  className,
}: KPICardProps) {
  const TrendIcon = value.trend === 'up' 
    ? TrendingUp 
    : value.trend === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = value.trend === 'up'
    ? 'text-green-500'
    : value.trend === 'down'
      ? 'text-red-500'
      : 'text-zinc-400';

  const trendBgColor = value.trend === 'up'
    ? 'bg-green-500/10'
    : value.trend === 'down'
      ? 'bg-red-500/10'
      : 'bg-zinc-500/10';

  return (
    <Card className={cn('bg-zinc-900/50 border-zinc-800', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-zinc-500">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {formatValue(value.current, format, currency)}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={cn(
              'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
              trendColor,
              trendBgColor
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {value.changePercent > 0 ? '+' : ''}
            {value.changePercent.toFixed(1)}%
          </span>
          <span className="text-xs text-zinc-500">
            vs periodo anterior
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

/**
 * Grid container for KPI cards
 */
export function KPIGrid({ children, columns = 4 }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {children}
    </div>
  );
}
