/**
 * ZADIA OS - BOM Active Tab Component
 * 
 * Tab content for the active BOM display and management
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calculator, Edit, Plus, Package } from 'lucide-react';
import { BillOfMaterials } from '../../types/inventory.types';
import { BOMSummaryCards } from './BOMSummaryCards';
import { BOMMaterialsList } from './BOMMaterialsList';
import { BOMProductionFeasibility } from './BOMProductionFeasibility';
import { ProductionFeasibility } from '../../services/entities/bom-production-validator.service';

interface BOMActiveTabProps {
  activeBOM: BillOfMaterials | null;
  productionFeasibility: ProductionFeasibility | null;
  onCalculateFeasibility: (bomId: string) => void;
  onEditBOM: (bom: BillOfMaterials) => void;
  onCreateBOM: () => void;
}

export function BOMActiveTab({ 
  activeBOM, 
  productionFeasibility, 
  onCalculateFeasibility, 
  onEditBOM, 
  onCreateBOM 
}: BOMActiveTabProps) {
  if (!activeBOM) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No hay BOM activa</p>
          <p className="text-muted-foreground mb-4">
            Este producto no tiene una lista de materiales configurada
          </p>
          <Button onClick={onCreateBOM}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera BOM
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            BOM Versión {activeBOM.version}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCalculateFeasibility(activeBOM.id)}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Verificar Producción
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditBOM(activeBOM)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <BOMSummaryCards bom={activeBOM} />
        <BOMMaterialsList items={activeBOM.items} />

        {productionFeasibility && (
          <BOMProductionFeasibility feasibility={productionFeasibility} />
        )}

        {activeBOM.notes && (
          <div>
            <h3 className="font-medium mb-2">Notas</h3>
            <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded">
              {activeBOM.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}