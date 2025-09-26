'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RawMaterial, FinishedProduct } from '@/modules/inventory/types';
import { MovementHistory } from '@/modules/inventory/components/MovementHistory';
import { MovementForm } from '@/modules/inventory/components/MovementForm';
import { getRawMaterialById, getFinishedProductById } from '@/modules/inventory/services/inventory.service';

interface InventoryDetailClientProps {
  type: 'raw-materials' | 'finished-products';
  id: string;
}

export function InventoryDetailClient({ type, id }: InventoryDetailClientProps) {
  const router = useRouter();
  const [item, setItem] = useState<RawMaterial | FinishedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: RawMaterial | FinishedProduct | null = null;
        
        if (type === 'raw-materials') {
          data = await getRawMaterialById(id);
        } else {
          data = await getFinishedProductById(id);
        }
        
        if (!data) {
          setError('Elemento no encontrado');
          return;
        }
        
        setItem(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar elemento');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [type, id]);

  const refreshItem = async () => {
    if (!item) return;
    
    try {
      let updatedItem: RawMaterial | FinishedProduct | null = null;
      
      if (type === 'raw-materials') {
        updatedItem = await getRawMaterialById(id);
      } else {
        updatedItem = await getFinishedProductById(id);
      }
      
      if (updatedItem) {
        setItem(updatedItem);
      }
    } catch (error) {
      console.error('Error refreshing item:', error);
    }
  };

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) {
      return { label: 'Sin Stock', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (currentStock <= minimumStock) {
      return { label: 'Stock Bajo', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { label: 'Stock OK', variant: 'default' as const, icon: Package };
  };

  const getItemUnit = (item: RawMaterial | FinishedProduct): string => {
    if ('unitOfMeasure' in item) {
      return item.unitOfMeasure;
    }
    return 'unidades';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold mb-2">Cargando elemento...</h2>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2 text-red-700">Error</h2>
          <p className="text-muted-foreground mb-4">{error || 'Elemento no encontrado'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
  const StockIcon = stockStatus.icon;

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">
              {type === 'raw-materials' ? 'Materia Prima' : 'Producto Terminado'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <MovementForm
            item={item}
            itemType={type === 'raw-materials' ? 'raw-material' : 'finished-product'}
            onSuccess={refreshItem}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">SKU</span>
                <p className="font-mono">{item.sku}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoría</span>
                <p>
                  <Badge variant="outline">{item.category}</Badge>
                </p>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stock Actual</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.currentStock}</span>
                  <span className="text-muted-foreground">{getItemUnit(item)}</span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stock Mínimo</span>
                <p>{item.minimumStock} {getItemUnit(item)}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estado</span>
                <div>
                  <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                    <StockIcon className="h-3 w-3" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  {type === 'raw-materials' ? 'Costo Unitario' : 'Precio de Venta'}
                </span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">
                    ${type === 'raw-materials' 
                      ? (item as RawMaterial).unitCost.toFixed(2)
                      : (item as FinishedProduct).sellingPrice.toFixed(2)
                    }
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Ubicación</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{item.location.warehouse}</span>
                  {item.location.section && (
                    <span className="text-muted-foreground">
                      • {item.location.section}
                    </span>
                  )}
                </div>
              </div>
              
              {item.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descripción</span>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Fecha de Creación</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {new Date(item.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Movimientos */}
        <div className="lg:col-span-2">
          <MovementHistory
            itemId={item.id}
            itemType={type === 'raw-materials' ? 'raw-material' : 'finished-product'}
            limit={50}
          />
        </div>
      </div>
    </div>
  );
}