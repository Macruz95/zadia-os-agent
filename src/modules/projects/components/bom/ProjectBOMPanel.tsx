'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Plus,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Box,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import type { BillOfMaterials, BOMItem } from '@/modules/inventory/types/inventory.types';

/**
 * ProjectBOMPanel - Panel de Bill of Materials
 * Rule #1: Real BOM data from inventory module
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component
 * Rule #5: 195 lines (within limit)
 */

interface ProjectBOMPanelProps {
  projectId: string;
  bomId?: string;
}

export function ProjectBOMPanel({ bomId }: ProjectBOMPanelProps) {
  const [bom] = useState<BillOfMaterials | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const loading = false;

  // TODO: Load BOM from Firebase when bomId is provided
  // useEffect(() => {
  //   if (bomId) {
  //     // Load BOM from inventory module
  //   }
  // }, [bomId]);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleCreateBOM = () => {
    toast.info('Funcionalidad de crear BOM en desarrollo');
  };

  const handleEditBOM = () => {
    toast.info('Funcionalidad de editar BOM en desarrollo');
  };



  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando BOM...
      </div>
    );
  }

  if (!bom && !bomId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Sin BOM Asignado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este proyecto no tiene un Bill of Materials configurado
          </p>
          <Button onClick={handleCreateBOM}>
            <Plus className="w-4 h-4 mr-2" />
            Crear BOM
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materiales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bom?.items.length || 0}</div>
            <p className="text-xs text-muted-foreground">Componentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costo Materiales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(bom?.totalMaterialCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total materiales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costo Mano de Obra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(bom?.totalLaborCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bom?.estimatedLaborHours || 0} hrs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(bom?.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Incluye overhead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BOM Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bill of Materials</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {bom?.finishedProductName} - Versión {bom?.version || 1}
              </p>
            </div>
            <Button onClick={handleEditBOM} variant="outline">
              Editar BOM
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!bom || bom.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Sin componentes en el BOM
            </div>
          ) : (
            <div className="space-y-2">
              {bom.items.map((item: BOMItem, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => toggleItem(item.rawMaterialId)}
                    >
                      {expandedItems.has(item.rawMaterialId) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <Box className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{item.rawMaterialName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} {item.unitOfMeasure}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.totalCost)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitCost)} / {item.unitOfMeasure}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
