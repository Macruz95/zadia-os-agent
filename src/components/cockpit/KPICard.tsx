/**
 * KPI Card Component
 * 
 * Tarjeta de KPI con sparkline, tendencia y tooltip inteligente
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 150 líneas
 */

'use client';

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { AnimatedCard, AnimatedNumber } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { SmartTooltip } from './SmartTooltip';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number; // Percentage change
  trendData?: number[]; // Data for sparkline
  trendLabel?: string;
  previousValue?: string | number;
  aiInsight?: string;
  tooltipDetails?: Array<{ label: string; value: string | number }>;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  className?: string;
  delay?: number;
}

const VARIANT_CONFIG = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    sparklineColor: '#6b7280',
    trendUp: 'text-emerald-500 dark:text-emerald-400',
    trendDown: 'text-red-500 dark:text-red-400',
  },
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    sparklineColor: '#34d399',
    trendUp: 'text-emerald-500 dark:text-emerald-400',
    trendDown: 'text-red-500 dark:text-red-400',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500 dark:text-amber-400',
    sparklineColor: '#fbbf24',
    trendUp: 'text-emerald-500 dark:text-emerald-400',
    trendDown: 'text-red-500 dark:text-red-400',
  },
  danger: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500 dark:text-red-400',
    sparklineColor: '#f87171',
    trendUp: 'text-emerald-500 dark:text-emerald-400',
    trendDown: 'text-red-500 dark:text-red-400',
  },
  info: {
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    sparklineColor: '#22d3ee',
    trendUp: 'text-emerald-500 dark:text-emerald-400',
    trendDown: 'text-red-500 dark:text-red-400',
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendData,
  trendLabel,
  previousValue,
  aiInsight,
  tooltipDetails,
  variant = 'default',
  loading = false,
  className,
  delay = 0,
}: KPICardProps) {
  const config = VARIANT_CONFIG[variant];

  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor = trend === undefined || trend === 0
    ? 'text-muted-foreground'
    : trend > 0
      ? config.trendUp
      : config.trendDown;

  if (loading) {
    return (
      <AnimatedCard delay={delay} glowColor={variant === 'default' ? 'primary' : variant} className={cn("bg-card border-border", className)}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-8 w-full bg-muted rounded" />
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard
      delay={delay}
      glowColor={variant === 'default' ? 'primary' : variant}
      className={cn(
        "bg-card border-border overflow-hidden relative group transition-colors duration-200",
        className
      )}
    >
      {/* Top glow line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px opacity-50",
        variant === 'success' && "bg-gradient-to-r from-transparent via-emerald-500 to-transparent",
        variant === 'warning' && "bg-gradient-to-r from-transparent via-amber-500 to-transparent",
        variant === 'danger' && "bg-gradient-to-r from-transparent via-red-500 to-transparent",
        variant === 'info' && "bg-gradient-to-r from-transparent via-cyan-500 to-transparent",
        variant === 'default' && "bg-gradient-to-r from-transparent via-gray-600 to-transparent",
      )} />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
            {(aiInsight || tooltipDetails) && (
              <SmartTooltip
                title={title}
                value={value}
                previousValue={previousValue}
                trend={trend}
                aiInsight={aiInsight}
                details={tooltipDetails}
              >
                <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
              </SmartTooltip>
            )}
          </div>
          {Icon && (
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", config.iconBg)}>
              <Icon className={cn("h-4 w-4", config.iconColor)} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </span>
          {subtitle && (
            <span className="text-xs text-muted-foreground ml-2">
              {subtitle}
            </span>
          )}
        </div>

        {/* Sparkline + Trend */}
        <div className="flex items-center justify-between">
          {trendData && trendData.length > 1 ? (
            <Sparkline
              data={trendData}
              width={80}
              height={24}
              strokeColor={config.sparklineColor}
            />
          ) : (
            <div className="w-20" />
          )}

          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend).toFixed(1)}%</span>
              {trendLabel && (
                <span className="text-muted-foreground/70 ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

