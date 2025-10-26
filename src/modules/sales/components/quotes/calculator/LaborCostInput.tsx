/**
 * ZADIA OS - Labor Cost Input Component
 * 
 * Component for configuring labor hours and rate
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module LaborCostInput
 */

'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, HardHat, Info } from 'lucide-react';
import type { LaborCostConfig } from '../../../types/calculator.types';

interface LaborCostInputProps {
  /** Current labor configuration */
  labor: LaborCostConfig;
  
  /** Callback when labor config changes */
  onChange: (labor: Partial<LaborCostConfig>) => void;
}

/**
 * Labor cost input component
 * Allows configuring hours and hourly rate for labor cost calculation
 */
export function LaborCostInput({ labor, onChange }: LaborCostInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <HardHat className="w-5 h-5 mr-2 text-primary" />
          Costo de Mano de Obra
        </CardTitle>
        <CardDescription>
          Configure las horas estimadas y el costo por hora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            Costo por Hora
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="hourlyRate"
              type="number"
              value={labor.hourlyRate}
              onChange={(e) =>
                onChange({ hourlyRate: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
              className="pl-7 pr-14"
              placeholder="3.75"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/ hora</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Costo promedio por hora de trabajo (incluye salario y beneficios)
          </p>
        </div>

        {/* Hours Estimated */}
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Horas Estimadas
          </Label>
          <div className="relative">
            <Input
              id="hours"
              type="number"
              value={labor.hours}
              onChange={(e) =>
                onChange({ hours: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.5"
              className="pr-14"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">horas</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Tiempo total estimado para completar el trabajo
          </p>
        </div>

        {/* Calculation Display */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cálculo:</span>
              <Badge variant="secondary" className="font-mono">
                {labor.hours} hrs × ${labor.hourlyRate.toFixed(2)}/hr
              </Badge>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Costo Total Mano de Obra:</span>
              <span className="text-2xl font-bold text-primary">
                ${labor.total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Tips */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            <strong>Consejo:</strong> Considere el tiempo de preparación, 
            ejecución, limpieza y retrabajos al estimar las horas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
