/**
 * ZADIA OS - Financial Summary Component
 * 
 * Visual summary of all financial calculations for a quote
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module FinancialSummary
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Calculator, FileText } from 'lucide-react';
import type { FinancialBreakdown } from '../../../types/calculator.types';

interface FinancialSummaryProps {
  /** Financial breakdown to display */
  breakdown: FinancialBreakdown;
  
  /** Currency code */
  currency?: string;
  
  /** Show detailed breakdown */
  showDetails?: boolean;
}

/**
 * Financial summary component
 * Displays a comprehensive breakdown of quote costs and pricing
 */
export function FinancialSummary({
  breakdown,
  currency = 'USD',
  showDetails = true,
}: FinancialSummaryProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calculator className="w-6 h-6 mr-2 text-blue-600" />
          Resumen Financiero
        </CardTitle>
        <CardDescription>
          Desglose completo de costos y precio de venta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Costs */}
        {showDetails && (
          <div className="space-y-2 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Costos Primarios
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mano de Obra:</span>
                <span className="font-medium">{formatAmount(breakdown.laborCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materiales:</span>
                <span className="font-medium">{formatAmount(breakdown.materialsCost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Costo Base:</span>
                <span>{formatAmount(breakdown.baseProductionCost)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Costs */}
        {showDetails && breakdown.additionalCosts > 0 && (
          <div className="space-y-2 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700">
              Costos Adicionales
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Desgaste, mantenimiento, logística:
              </span>
              <span className="font-medium">{formatAmount(breakdown.additionalCosts)}</span>
            </div>
          </div>
        )}

        {/* Production Cost */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              Costo Total de Producción:
            </span>
            <span className="text-lg font-bold text-yellow-800">
              {formatAmount(breakdown.totalProductionCost)}
            </span>
          </div>
        </div>

        {/* Commercial Margin */}
        <div className="space-y-2 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-semibold text-sm text-gray-700">
                Margen Comercial
              </span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {breakdown.commercialMarginPercent}%
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ganancia Bruta:</span>
            <span className="font-medium text-purple-700">
              {formatAmount(breakdown.grossProfit)}
            </span>
          </div>
        </div>

        {/* Sale Price */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              Precio de Venta (sin IVA):
            </span>
            <span className="text-lg font-bold text-green-700">
              {formatAmount(breakdown.salePrice)}
            </span>
          </div>
        </div>

        {/* Taxes */}
        {breakdown.taxes.length > 0 && (
          <div className="space-y-2 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-700">Impuestos</h3>
            {breakdown.taxes.map((tax) => (
              <div key={tax.name} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {tax.name} ({tax.rate}%):
                </span>
                <span className="font-medium">{formatAmount(tax.amount)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-sm">
              <span>Total Impuestos:</span>
              <span>{formatAmount(breakdown.totalTaxes)}</span>
            </div>
          </div>
        )}

        {/* Final Price */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">PRECIO FINAL</p>
              <p className="text-3xl font-bold flex items-center">
                <DollarSign className="w-8 h-8" />
                {breakdown.finalPrice.toFixed(2)}
              </p>
              <p className="text-blue-100 text-xs mt-1">
                {currency} • Incluye todos los impuestos
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-100">Margen Real</p>
                <p className="text-lg font-bold">
                  {breakdown.finalPrice > 0
                    ? ((breakdown.grossProfit / breakdown.finalPrice) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="text-xs text-gray-500 text-center bg-white rounded p-2">
          💡 Este precio garantiza rentabilidad y cubre todos los costos de producción
        </div>
      </CardContent>
    </Card>
  );
}
