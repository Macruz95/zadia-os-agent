/**
 * ZADIA OS - BOM Production Feasibility Component
 * 
 * Displays production feasibility analysis for a BOM
 */

import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ProductionFeasibility } from '../../services/entities/bom-production-validator.service';

interface BOMProductionFeasibilityProps {
  feasibility: ProductionFeasibility;
}

export function BOMProductionFeasibility({ feasibility }: BOMProductionFeasibilityProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Viabilidad de Producción</h3>
      <div className={`p-4 rounded border ${
        feasibility.canProduce 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {feasibility.canProduce ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">
            {feasibility.canProduce 
              ? 'Producción Posible' 
              : 'Materiales Insuficientes'
            }
          </span>
        </div>
        <p className="text-sm mb-2">
          Cantidad máxima posible: {feasibility.maxQuantity} unidades
        </p>
        
        {feasibility.missingMaterials.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Materiales faltantes:</p>
            <div className="space-y-1">
              {feasibility.missingMaterials.map((missing, index) => (
                <p key={index} className="text-xs text-red-600">
                  • {missing.rawMaterialName}: faltan {missing.shortage} unidades
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}