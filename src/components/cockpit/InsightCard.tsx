/**
 * Consejero Digital - Tarjeta de Insight
 * 
 * Tarjeta individual para mostrar un insight con acciones
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 120 líneas
 */

'use client';

import Link from 'next/link';
import { 
  AlertTriangle, 
  TrendingUp, 
  Info, 
  Zap,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Insight, InsightType, InsightPriority } from './use-digital-advisor';

interface InsightCardProps {
  insight: Insight;
  className?: string;
}

const TYPE_CONFIG: Record<InsightType, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  risk: { 
    icon: AlertTriangle, 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10 border-red-500/20' 
  },
  opportunity: { 
    icon: TrendingUp, 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-500/10 border-emerald-500/20' 
  },
  info: { 
    icon: Info, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10 border-blue-500/20' 
  },
  action: { 
    icon: Zap, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10 border-amber-500/20' 
  },
};

const PRIORITY_BADGE: Record<InsightPriority, { label: string; className: string }> = {
  critical: { label: 'Crítico', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high: { label: 'Alto', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { label: 'Medio', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Bajo', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export function InsightCard({ insight, className }: InsightCardProps) {
  const typeConfig = TYPE_CONFIG[insight.type];
  const priorityConfig = PRIORITY_BADGE[insight.priority];
  const Icon = typeConfig.icon;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-200",
      "hover:shadow-lg hover:shadow-black/20",
      typeConfig.bgColor,
      className
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          "bg-gray-900/50"
        )}>
          <Icon className={cn("h-5 w-5", typeConfig.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-200 truncate">
              {insight.title}
            </h4>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
              priorityConfig.className
            )}>
              {priorityConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">
            {insight.description}
          </p>
        </div>
      </div>

      {/* Impact */}
      {insight.impact && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gray-900/30">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-300 font-medium">
            {insight.impact}
          </span>
        </div>
      )}

      {/* Actions */}
      {insight.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insight.actions.map((action) => (
            action.href ? (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                asChild
                className={cn(
                  action.variant === 'primary' 
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                    : 'border-gray-700 hover:border-gray-600'
                )}
              >
                <Link href={action.href}>
                  {action.label}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  action.variant === 'primary' 
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                    : 'border-gray-700 hover:border-gray-600'
                )}
              >
                {action.label}
              </Button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

