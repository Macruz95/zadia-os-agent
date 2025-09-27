'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Calculator, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { BOMBuilder } from './BOMBuilder';
import { useBOM } from '../../hooks/use-bom';
import { BillOfMaterials, FinishedProduct } from '../../types/inventory.types';
import { getFinishedProductById } from '../../services/inventory.service';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface BOMManagementPageProps {
  productId: string;
}

export function BOMManagementPage({ productId }: BOMManagementPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<FinishedProduct | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BillOfMaterials | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  const {
    bom: activeBOM,
    boms,
    loading,
    error,
    productionFeasibility,
    deactivateBOM,
    getBOMsForProduct,
    getActiveBOMForProduct,
    calculateProductionFeasibility
  } = useBOM();

  // Load product and BOMs on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await getFinishedProductById(productId);
        if (!productData) {
          toast.error('Producto no encontrado');
          router.push('/inventory');
          return;
        }

        setProduct(productData);
        await Promise.all([
          getActiveBOMForProduct(productId),
          getBOMsForProduct(productId)
        ]);
      } catch (error) {
        logger.error('Error loading BOM data:', error as Error);
        toast.error('Error al cargar datos del producto');
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId, getActiveBOMForProduct, getBOMsForProduct, router]);

  const handleCreateBOM = () => {
    setEditingBOM(null);
    setShowBuilder(true);
  };

  const handleEditBOM = (bom: BillOfMaterials) => {
    setEditingBOM(bom);
    setShowBuilder(true);
  };

  const handleSaveBOM = async () => {
    // Simplified implementation - functionality in development
    const mode = editingBOM ? 'actualización' : 'creación';
    toast.info(`Funcionalidad de ${mode} de BOM en desarrollo`);
    setShowBuilder(false);
    setEditingBOM(null);
  };

  const handleDeactivateBOM = async (bomId: string) => {
    try {
      await deactivateBOM(bomId);
      toast.success('BOM desactivada exitosamente');
      
      // Refresh data
      await Promise.all([
        getActiveBOMForProduct(productId),
        getBOMsForProduct(productId)
      ]);
    } catch (error) {
      logger.error('Error deactivating BOM:', error as Error);
      toast.error('Error al desactivar BOM');
    }
  };

  const handleCalculateFeasibility = async (bomId: string, quantity: number = 1) => {
    try {
      await calculateProductionFeasibility(bomId, quantity);
    } catch (error) {
      logger.error('Error calculating production feasibility:', error as Error);
      toast.error('Error al calcular viabilidad de producción');
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="container mx-auto p-6">
        <BOMBuilder
          finishedProductId={product.id}
          finishedProductName={product.name}
          initialData={undefined}
          onSave={handleSaveBOM}
          onCancel={() => {
            setShowBuilder(false);
            setEditingBOM(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Lista de Materiales
            </h1>
            <p className="text-muted-foreground">
              Producto: {product.name} (SKU: {product.sku})
            </p>
          </div>
        </div>
        <Button onClick={handleCreateBOM} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva BOM
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOM Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">BOM Activa</TabsTrigger>
          <TabsTrigger value="history">Historial de Versiones</TabsTrigger>
        </TabsList>

        {/* Active BOM */}
        <TabsContent value="current" className="space-y-4">
          {activeBOM ? (
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
                      onClick={() => handleCalculateFeasibility(activeBOM.id)}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Verificar Producción
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBOM(activeBOM)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* BOM Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">{activeBOM.items.length}</div>
                    <p className="text-sm text-muted-foreground">Materiales</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">${activeBOM.totalMaterialCost.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Costo Materiales</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">{activeBOM.estimatedLaborHours}h</div>
                    <p className="text-sm text-muted-foreground">Horas Trabajo</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">${activeBOM.totalCost.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Costo Total</p>
                  </div>
                </div>

                {/* Materials List */}
                <div>
                  <h3 className="font-medium mb-3">Materiales Requeridos</h3>
                  <div className="space-y-2">
                    {activeBOM.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{item.rawMaterialName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unitOfMeasure}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          ${item.totalCost.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production Feasibility */}
                {productionFeasibility && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Viabilidad de Producción</h3>
                    <div className={`p-4 rounded border ${
                      productionFeasibility.canProduce 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {productionFeasibility.canProduce ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {productionFeasibility.canProduce 
                            ? 'Producción Posible' 
                            : 'Materiales Insuficientes'
                          }
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        Cantidad máxima posible: {productionFeasibility.maxQuantityPossible} unidades
                      </p>
                      
                      {productionFeasibility.missingMaterials.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Materiales faltantes:</p>
                          <div className="space-y-1">
                            {productionFeasibility.missingMaterials.map((missing, index) => (
                              <p key={index} className="text-xs text-red-600">
                                • {missing.materialName}: faltan {missing.missing} unidades
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No hay BOM activa</p>
                <p className="text-muted-foreground mb-4">
                  Este producto no tiene una lista de materiales configurada
                </p>
                <Button onClick={handleCreateBOM}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera BOM
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BOM History */}
        <TabsContent value="history" className="space-y-4">
          {boms.length > 0 ? (
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
                          onClick={() => handleEditBOM(bom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {bom.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateBOM(bom.id)}
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
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No hay versiones de BOM registradas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}