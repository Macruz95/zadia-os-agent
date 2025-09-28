'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { BOMBuilder } from './BOMBuilder';
import { BOMPageHeader } from './BOMPageHeader';
import { BOMActiveTab } from './BOMActiveTab';
import { BOMHistoryTab } from './BOMHistoryTab';
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

  const handleCalculateFeasibility = async (bomId: string) => {
    try {
      await calculateProductionFeasibility(bomId, 1);
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
      <BOMPageHeader 
        product={product}
        onBack={() => router.back()}
        onCreateBOM={handleCreateBOM}
        loading={loading}
      />

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">BOM Activa</TabsTrigger>
          <TabsTrigger value="history">Historial de Versiones</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <BOMActiveTab
            activeBOM={activeBOM || null}
            productionFeasibility={productionFeasibility || null}
            onCalculateFeasibility={handleCalculateFeasibility}
            onEditBOM={handleEditBOM}
            onCreateBOM={handleCreateBOM}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BOMHistoryTab
            boms={boms}
            onEditBOM={handleEditBOM}
            onDeactivateBOM={handleDeactivateBOM}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}