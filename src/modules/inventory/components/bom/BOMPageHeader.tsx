/**
 * ZADIA OS - BOM Page Header Component
 * 
 * Header with navigation and action buttons for BOM management
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import { FinishedProduct } from '../../types/inventory.types';

interface BOMPageHeaderProps {
  product: FinishedProduct;
  onBack: () => void;
  onCreateBOM: () => void;
  loading?: boolean;
}

export function BOMPageHeader({ product, onBack, onCreateBOM, loading = false }: BOMPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
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
      <Button onClick={onCreateBOM} disabled={loading}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva BOM
      </Button>
    </div>
  );
}