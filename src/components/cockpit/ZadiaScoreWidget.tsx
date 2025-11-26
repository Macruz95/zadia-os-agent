/**
 * ZADIA Score™ - Widget Completo
 * 
 * Combina el gauge radial con el desglose de métricas
 * REGLA 1: DATOS REALES - Muestra estado real del sistema
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 120 líneas
 */

'use client';

import { Activity, Info, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ZadiaScoreGauge } from './ZadiaScoreGauge';
import { ScoreMetricsBreakdown } from './ScoreMetricsBreakdown';
import { useZadiaScore } from './use-zadia-score';

interface ZadiaScoreWidgetProps {
  className?: string;
}

export function ZadiaScoreWidget({ className }: ZadiaScoreWidgetProps) {
  const { score, previousScore, metrics, loading, error, hasData } = useZadiaScore();

  return (
    <Card className={cn(
      "bg-[#161b22] border-gray-800/50 overflow-hidden relative",
      className
    )}>
      {/* Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Activity className="h-5 w-5 text-cyan-400" />
            ZADIA Score™
          </CardTitle>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-500 hover:text-gray-400 transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs bg-gray-900 border-gray-800">
                <p className="text-xs text-gray-300">
                  El ZADIA Score™ es una puntuación holística de 0-100 que mide la salud 
                  general de tu empresa, calculada en tiempo real desde tus datos en Firebase.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-400 text-sm">
            {error}
          </div>
        ) : !hasData && !loading ? (
          // No data state - show empty state
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-1">Sin datos suficientes</p>
            <p className="text-gray-600 text-xs">
              Agrega clientes, proyectos y facturas para ver tu ZADIA Score
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Gauge */}
            <div className="flex justify-center">
              <ZadiaScoreGauge 
                score={score} 
                previousScore={previousScore ?? undefined}
                loading={loading}
                size="lg"
              />
            </div>

            {/* Metrics Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Desglose de Métricas
              </h4>
              <ScoreMetricsBreakdown metrics={metrics} loading={loading} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
