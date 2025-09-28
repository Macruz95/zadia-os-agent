/**
 * ZADIA OS - BOM Cost Summary Component
 * 
 * Displays cost breakdown and totals for the BOM
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

interface BOMCostSummaryProps {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
}

export function BOMCostSummary({
  totalMaterialCost,
  totalLaborCost,
  totalOverheadCost,
  totalCost
}: BOMCostSummaryProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Resumen de Costos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Costo de Materiales:</span>
          <Badge variant="outline">${totalMaterialCost.toFixed(2)}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Costo de Mano de Obra:</span>
          <Badge variant="outline">${totalLaborCost.toFixed(2)}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Gastos Indirectos:</span>
          <Badge variant="outline">${totalOverheadCost.toFixed(2)}</Badge>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-medium text-lg">
          <span>Costo Total:</span>
          <Badge className="text-lg px-3 py-1">
            ${totalCost.toFixed(2)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}