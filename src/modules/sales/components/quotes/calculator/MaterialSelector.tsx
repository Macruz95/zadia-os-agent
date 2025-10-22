/**
 * ZADIA OS - Material Selector for Quote Calculator
 * 
 * Component for selecting materials from inventory
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module MaterialSelector
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { CalculatorMaterial } from '../../../types/calculator.types';

interface MaterialSelectorProps {
  /** Callback when material is added */
  onAddMaterial: (material: Omit<CalculatorMaterial, 'subtotal'>) => void;
  
  /** List of available inventory items */
  inventoryItems: Array<{
    id: string;
    name: string;
    unitPrice: number;
    unit: string;
    availableQuantity?: number;
  }>;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Material selector component
 * Allows selecting materials from inventory and adding them to quote
 */
export function MaterialSelector({
  onAddMaterial,
  inventoryItems,
  isLoading = false,
}: MaterialSelectorProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  // Auto-select first item when inventory loads
  useEffect(() => {
    if (inventoryItems.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(inventoryItems[0].id);
    }
  }, [inventoryItems, selectedMaterialId]);

  const handleAdd = () => {
    if (!selectedMaterialId) {
      toast.error('Seleccione un material');
      return;
    }

    const material = inventoryItems.find((m) => m.id === selectedMaterialId);
    if (!material) {
      toast.error('Material no encontrado');
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    // Check available quantity if provided
    if (material.availableQuantity !== undefined && qty > material.availableQuantity) {
      toast.error(`Stock insuficiente. Disponible: ${material.availableQuantity} ${material.unit}`);
      return;
    }

    onAddMaterial({
      id: material.id,
      name: material.name,
      unitPrice: material.unitPrice,
      unit: material.unit,
      quantity: qty,
    });

    // Reset quantity after adding
    setQuantity('1');
    toast.success(`${material.name} agregado`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <Package className="w-5 h-5 mr-2 animate-spin" />
        Cargando materiales...
      </div>
    );
  }

  if (inventoryItems.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No hay materiales disponibles en el inventario</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        {/* Material selector */}
        <div className="flex-grow">
          <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar material" />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{material.name}</span>
                    <span className="text-xs text-gray-500">
                      ${material.unitPrice.toFixed(2)}/{material.unit}
                      {material.availableQuantity !== undefined && (
                        <> • Stock: {material.availableQuantity}</>
                      )}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity input */}
        <div className="w-full sm:w-32">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0.1"
            step="0.1"
            placeholder="Cantidad"
            className="text-center"
          />
        </div>

        {/* Add button */}
        <Button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Añadir
        </Button>
      </div>

      {/* Selected material info */}
      {selectedMaterialId && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          {(() => {
            const material = inventoryItems.find((m) => m.id === selectedMaterialId);
            if (!material) return null;
            const qty = parseFloat(quantity) || 0;
            const subtotal = material.unitPrice * qty;
            return (
              <div className="flex justify-between items-center">
                <span>
                  {qty} {material.unit} × ${material.unitPrice.toFixed(2)}
                </span>
                <span className="font-bold">= ${subtotal.toFixed(2)}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
