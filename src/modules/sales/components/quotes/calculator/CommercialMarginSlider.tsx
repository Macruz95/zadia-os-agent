/**
 * ZADIA OS - Commercial Margin Slider Component
 * 
 * Component for adjusting commercial margin percentage
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module CommercialMarginSlider
 */

'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Percent, Info } from 'lucide-react';

interface CommercialMarginSliderProps {
  /** Current margin percentage */
  value: number;
  
  /** Callback when margin changes */
  onChange: (value: number) => void;
  
  /** Production cost for profit calculation */
  productionCost: number;
  
  /** Calculated gross profit */
  grossProfit: number;
  
  /** Min margin percentage */
  min?: number;
  
  /** Max margin percentage */
  max?: number;
}

/**
 * Commercial margin slider component
 * Allows adjusting profit margin with visual feedback
 */
export function CommercialMarginSlider({
  value,
  onChange,
  productionCost,
  grossProfit,
  min = 0,
  max = 100,
}: CommercialMarginSliderProps) {
  // Determine margin category
  const getMarginCategory = (margin: number) => {
    if (margin < 15) return { label: 'Bajo', color: 'bg-red-100 text-red-800' };
    if (margin < 25) return { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' };
    if (margin < 35) return { label: 'Bueno', color: 'bg-green-100 text-green-800' };
    return { label: 'Alto', color: 'bg-blue-100 text-blue-800' };
  };

  const category = getMarginCategory(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Margen Comercial
          </div>
          <Badge className={category.color}>{category.label}</Badge>
        </CardTitle>
        <CardDescription>
          Ajuste el porcentaje de ganancia deseado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center">
              <Percent className="w-4 h-4 mr-2 text-gray-500" />
              Porcentaje de Margen
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  if (newValue >= min && newValue <= max) {
                    onChange(newValue);
                  }
                }}
                min={min}
                max={max}
                step="0.1"
                className="w-20 text-center"
              />
              <span className="text-sm font-bold text-purple-700">%</span>
            </div>
          </div>

          <Slider
            value={[value]}
            onValueChange={([newValue]) => onChange(newValue)}
            min={min}
            max={max}
            step={0.5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>{min}%</span>
            <span>{max}%</span>
          </div>
        </div>

        {/* Profit Display */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Costo de Producción:</span>
              <span className="font-medium">${productionCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Margen ({value}%):</span>
              <span className="font-medium text-purple-700">
                +${grossProfit.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-purple-300 my-2"></div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                Precio de Venta:
              </span>
              <span className="text-lg font-bold text-purple-800">
                ${(productionCost + grossProfit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Tips */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Recomendaciones:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Proyectos estándar: 25-30%</li>
                <li>Proyectos complejos: 30-40%</li>
                <li>Reparaciones rápidas: 20-25%</li>
                <li>Trabajos premium: 40-50%</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
