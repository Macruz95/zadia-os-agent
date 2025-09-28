/**
 * ZADIA OS - BOM History Tab Component
 * 
 * Tab content for BOM version history display and management
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { BillOfMaterials } from '../../types/inventory.types';

interface BOMHistoryTabProps {
  boms: BillOfMaterials[];
  onEditBOM: (bom: BillOfMaterials) => void;
  onDeactivateBOM: (bomId: string) => void;
}

export function BOMHistoryTab({ boms, onEditBOM, onDeactivateBOM }: BOMHistoryTabProps) {
  if (boms.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No hay versiones de BOM registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {boms.map((bom) => (
        <Card key={bom.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Versión {bom.version}
                {bom.isActive && (
                  <Badge variant="default">Activa</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditBOM(bom)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {bom.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeactivateBOM(bom.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-bold">{bom.items.length}</div>
                <p className="text-xs text-muted-foreground">Materiales</p>
              </div>
              <div>
                <div className="font-bold">${bom.totalMaterialCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Costo Materiales</p>
              </div>
              <div>
                <div className="font-bold">{bom.estimatedLaborHours}h</div>
                <p className="text-xs text-muted-foreground">Horas</p>
              </div>
              <div>
                <div className="font-bold">${bom.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Costo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}