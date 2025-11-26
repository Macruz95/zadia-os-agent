/**
 * Smart Tooltip Component
 * 
 * Tooltip avanzado con insights de IA
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 100 líneas
 */

'use client';

import { ReactNode } from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTooltipProps {
  children: ReactNode;
  title: string;
  value?: string | number;
  previousValue?: string | number;
  trend?: number;
  aiInsight?: string;
  details?: Array<{ label: string; value: string | number }>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function SmartTooltip({
  children,
  title,
  value,
  previousValue,
  trend,
  aiInsight,
  details,
  side = 'top',
  className,
}: SmartTooltipProps) {
  const TrendIcon = trend === undefined || trend === 0 
    ? Minus 
    : trend > 0 
      ? TrendingUp 
      : TrendingDown;

  const trendColor = trend === undefined || trend === 0
    ? 'text-gray-500'
    : trend > 0
      ? 'text-emerald-400'
      : 'text-red-400';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className={cn(
            "w-72 p-0 bg-[#1a1f2e] border-gray-700/50 shadow-xl shadow-black/30",
            "rounded-xl overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-gray-700/50">
            <h4 className="font-semibold text-white text-sm">{title}</h4>
          </div>

          <div className="p-4 space-y-3">
            {/* Current vs Previous */}
            {value !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{value}</span>
                {trend !== undefined && (
                  <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
                    <TrendIcon className="h-4 w-4" />
                    <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}

            {previousValue !== undefined && (
              <p className="text-xs text-gray-500">
                Período anterior: <span className="text-gray-400">{previousValue}</span>
              </p>
            )}

            {/* Details */}
            {details && details.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-700/50">
                {details.map((detail, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{detail.label}</span>
                    <span className="text-gray-300 font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Insight */}
            {aiInsight && (
              <div className="flex gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Brain className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-200 leading-relaxed">
                  {aiInsight}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

