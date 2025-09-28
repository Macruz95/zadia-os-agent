/**
 * ZADIA OS - BOM Summary Cards Component
 * 
 * Summary statistics cards for BOM information
 */

import { BillOfMaterials } from '../../types/inventory.types';

interface BOMSummaryCardsProps {
  bom: BillOfMaterials;
}

export function BOMSummaryCards({ bom }: BOMSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 border rounded">
        <div className="text-lg font-bold">{bom.items.length}</div>
        <p className="text-sm text-muted-foreground">Materiales</p>
      </div>
      <div className="text-center p-3 border rounded">
        <div className="text-lg font-bold">${bom.totalMaterialCost.toFixed(2)}</div>
        <p className="text-sm text-muted-foreground">Costo Materiales</p>
      </div>
      <div className="text-center p-3 border rounded">
        <div className="text-lg font-bold">{bom.estimatedLaborHours}h</div>
        <p className="text-sm text-muted-foreground">Horas Trabajo</p>
      </div>
      <div className="text-center p-3 border rounded">
        <div className="text-lg font-bold">${bom.totalCost.toFixed(2)}</div>
        <p className="text-sm text-muted-foreground">Costo Total</p>
      </div>
    </div>
  );
}