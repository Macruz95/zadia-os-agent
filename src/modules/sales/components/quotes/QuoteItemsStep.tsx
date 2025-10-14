'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { QuoteProductSelector } from './QuoteProductSelector';
import { QuoteItemsTable } from './QuoteItemsTable';
import type { QuoteItem } from '../../types/sales.types';
import type { QuoteProduct } from '../../hooks/use-product-search';

interface QuoteFormData {
  items: Omit<QuoteItem, 'id'>[];
}

interface QuoteItemsStepProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function QuoteItemsStep({ formData, updateFormData }: QuoteItemsStepProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    formData.items.map((item) => item.productId).filter((id): id is string => !!id)
  );

  const handleProductSelect = (product: QuoteProduct) => {
    // Agregar producto como item
    const newItem: Omit<QuoteItem, 'id'> = {
      productId: product.id,
      description: product.name,
      quantity: 1,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: product.unitPrice,
      discount: 0,
      subtotal: product.unitPrice,
    };

    const updatedItems = [...formData.items, newItem];
    updateFormData({ items: updatedItems });
    setSelectedProductIds([...selectedProductIds, product.id]);
  };

  const handleItemsChange = (updatedItems: Omit<QuoteItem, 'id'>[]) => {
    updateFormData({ items: updatedItems });
    // Actualizar IDs seleccionados
    const ids = updatedItems.map((item) => item.productId).filter((id): id is string => !!id);
    setSelectedProductIds(ids);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Busque y agregue productos o materias primas a la cotización. Puede editar cantidades, 
          precios y descuentos directamente en la tabla.
        </AlertDescription>
      </Alert>

      {/* Selector de productos */}
      <div>
        <h3 className="text-sm font-medium mb-3">Buscar Productos</h3>
        <QuoteProductSelector
          onProductSelect={handleProductSelect}
          selectedProductIds={selectedProductIds}
        />
      </div>

      {/* Tabla de items */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          Items de la Cotización ({formData.items.length})
        </h3>
        <QuoteItemsTable items={formData.items} onItemsChange={handleItemsChange} />
      </div>
    </div>
  );
}
