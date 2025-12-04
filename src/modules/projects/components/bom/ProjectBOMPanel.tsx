'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Plus,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Box,
  Layers,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { BOMService } from '@/modules/inventory/services/entities/bom.service';
import type { BillOfMaterials, BOMItem } from '@/modules/inventory/types/inventory.types';
import { logger } from '@/lib/logger';
import Link from 'next/link';

/**
 * ProjectBOMPanel - Panel de Bill of Materials
 * Rule #1: Real BOM data from inventory module
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component
 * Rule #5: Within 200 lines
 */

interface ProjectBOMPanelProps {
  projectId: string;
  bomId?: string;
}

export function ProjectBOMPanel({ projectId, bomId }: ProjectBOMPanelProps) {
  const [bom, setBom] = useState<BillOfMaterials | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load BOM from Firebase when bomId is provided
  useEffect(() => {
    async function loadBOM() {
      if (!bomId) return;
      
      setLoading(true);
      try {
        const bomData = await BOMService.getBOMById(bomId);
        setBom(bomData);
        logger.debug('BOM loaded for project', { projectId, bomId, metadata: { bom: bomData } });
      } catch (error) {
        logger.error('Error loading BOM', error instanceof Error ? error : undefined, { projectId, bomId });
        toast.error('Error al cargar el BOM');
      } finally {
        setLoading(false);
      }
    }
    
    loadBOM();
  }, [bomId, projectId]);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleRefresh = async () => {
    if (!bomId) return;
    
    setLoading(true);
    try {
      const bomData = await BOMService.getBOMById(bomId);
      setBom(bomData);
      toast.success('BOM actualizado');
    } catch {
      toast.error('Error al actualizar BOM');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando BOM...</span>
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
            Este proyecto no tiene un Bill of Materials configurado.
            Puedes crear uno desde el módulo de Inventario.
          </p>
          <Button asChild>
            <Link href="/inventory?tab=bom">
              <Plus className="w-4 h-4 mr-2" />
              Ir a Inventario / BOM
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!bom && bomId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="font-medium text-lg mb-2">BOM No Encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            El BOM asignado (ID: {bomId}) no se encontró en el sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Mano de Obra
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
          </CardContent>
        </Card>
      </div>

      {/* BOM Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{bom?.finishedProductName || 'Bill of Materials'}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Versión {bom?.version || 1}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/inventory/bom/${bom?.finishedProductId}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Inventario
                </Link>
              </Button>
            </div>
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
