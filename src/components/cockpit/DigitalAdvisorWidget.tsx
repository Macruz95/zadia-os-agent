/**
 * Consejero Digital - Widget Principal
 * 
 * Panel de insights estratégicos con acciones sugeridas
 * REGLA 1: DATOS REALES de Firebase
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 120 líneas
 */

'use client';

import { Brain, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InsightCard } from './InsightCard';
import { useDigitalAdvisor } from './use-digital-advisor';

interface DigitalAdvisorWidgetProps {
  className?: string;
  maxInsights?: number;
}

export function DigitalAdvisorWidget({ className, maxInsights = 4 }: DigitalAdvisorWidgetProps) {
  const { insights, loading, error, refresh } = useDigitalAdvisor();
  
  const displayedInsights = insights.slice(0, maxInsights);

  return (
    <Card className={cn(
      "bg-[#161b22] border-gray-800/50 overflow-hidden relative",
      className
    )}>
      {/* Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Brain className="h-5 w-5 text-purple-400" />
            Consejero Digital
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-300"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Insights basados en el análisis de tus datos
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-400 text-sm">
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-800/30 p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-800 rounded" />
                    <div className="h-3 w-full bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedInsights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-1">Todo en orden</p>
            <p className="text-gray-600 text-xs">
              No hay alertas o acciones pendientes en este momento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            
            {insights.length > maxInsights && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300">
                  Ver {insights.length - maxInsights} más
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

