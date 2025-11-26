/**
 * ZADIA Score™ - Gauge Radial de Salud Empresarial
 * 
 * El "EKG" de la empresa - puntuación holística 0-100
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 200 líneas
 */

'use client';

import { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZadiaScoreGaugeProps {
  score: number; // 0-100
  previousScore?: number;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const SIZE_CONFIG = {
  sm: { width: 120, stroke: 8, fontSize: 'text-2xl' },
  md: { width: 160, stroke: 10, fontSize: 'text-3xl' },
  lg: { width: 200, stroke: 12, fontSize: 'text-4xl' },
};

export function ZadiaScoreGauge({ 
  score, 
  previousScore, 
  loading = false,
  size = 'md',
  showDetails = true 
}: ZadiaScoreGaugeProps) {
  const config = SIZE_CONFIG[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the arc (270 degrees = 3/4 of circle)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  const scoreData = useMemo(() => {
    if (score >= 80) return { 
      label: 'Excelente', 
      color: 'text-emerald-400', 
      bgColor: 'stroke-emerald-500',
      glowColor: 'shadow-emerald-500/30'
    };
    if (score >= 60) return { 
      label: 'Bueno', 
      color: 'text-cyan-400', 
      bgColor: 'stroke-cyan-500',
      glowColor: 'shadow-cyan-500/30'
    };
    if (score >= 40) return { 
      label: 'Regular', 
      color: 'text-amber-400', 
      bgColor: 'stroke-amber-500',
      glowColor: 'shadow-amber-500/30'
    };
    if (score >= 20) return { 
      label: 'Bajo', 
      color: 'text-orange-400', 
      bgColor: 'stroke-orange-500',
      glowColor: 'shadow-orange-500/30'
    };
    return { 
      label: 'Crítico', 
      color: 'text-red-400', 
      bgColor: 'stroke-red-500',
      glowColor: 'shadow-red-500/30'
    };
  }, [score]);

  const trend = useMemo(() => {
    if (!previousScore) return null;
    const diff = score - previousScore;
    if (diff > 2) return { icon: TrendingUp, label: `+${diff.toFixed(1)}`, color: 'text-emerald-400' };
    if (diff < -2) return { icon: TrendingDown, label: `${diff.toFixed(1)}`, color: 'text-red-400' };
    return { icon: Minus, label: '0', color: 'text-gray-500' };
  }, [score, previousScore]);

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center", `w-[${config.width}px]`)}>
        <div className="relative animate-pulse">
          <div className={cn("rounded-full bg-gray-800", `w-[${config.width}px] h-[${config.width}px]`)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Gauge SVG */}
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-[135deg]"
        >
          {/* Background Arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-gray-800"
          />
          
          {/* Progress Arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            className={cn(scoreData.bgColor, "transition-all duration-1000 ease-out")}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("font-mono font-bold", config.fontSize, scoreData.color)}>
            {Math.round(score)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            ZADIA Score
          </div>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {/* Status Label */}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
            "bg-gray-800/50 border border-gray-700/50",
            scoreData.color
          )}>
            <Activity className="h-3 w-3 inline mr-1.5" />
            {scoreData.label}
          </div>

          {/* Trend */}
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs", trend.color)}>
              <trend.icon className="h-3 w-3" />
              <span>{trend.label} vs mes anterior</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

