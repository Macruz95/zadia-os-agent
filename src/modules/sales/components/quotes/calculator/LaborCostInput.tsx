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
import { Clock, DollarSign, HardHat } from 'lucide-react';
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
          <HardHat className="w-5 h-5 mr-2 text-green-600" />
          Costo de Mano de Obra
        </CardTitle>
        <CardDescription>
          Configure las horas estimadas y el costo por hora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
            Costo por Hora
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">$</span>
            <Input
              id="hourlyRate"
              type="number"
              value={labor.hourlyRate}
              onChange={(e) =>
                onChange({ hourlyRate: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
              className="flex-grow"
              placeholder="3.75"
            />
            <span className="text-sm text-gray-500">/ hora</span>
          </div>
          <p className="text-xs text-gray-500">
            Costo promedio por hora de trabajo (incluye salario y beneficios)
          </p>
        </div>

        {/* Hours Estimated */}
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            Horas Estimadas
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="hours"
              type="number"
              value={labor.hours}
              onChange={(e) =>
                onChange({ hours: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.5"
              className="flex-grow"
              placeholder="0"
            />
            <span className="text-sm text-gray-500">horas</span>
          </div>
          <p className="text-xs text-gray-500">
            Tiempo total estimado para completar el trabajo
          </p>
        </div>

        {/* Calculation Display */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cálculo:</span>
            <span className="text-sm font-mono text-gray-700">
              {labor.hours} hrs × ${labor.hourlyRate.toFixed(2)}/hr
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">
              Costo Total Mano de Obra:
            </span>
            <span className="text-xl font-bold text-green-700">
              ${labor.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Info Tips */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>💡 Consejo:</strong> Considere el tiempo de preparación, 
            ejecución, limpieza y retrabajos al estimar las horas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
