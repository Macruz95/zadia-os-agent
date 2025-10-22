/**
 * ZADIA OS - Materials List Component
 * 
 * Displays and manages list of selected materials for quote
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module MaterialsList
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Package, Edit3 } from 'lucide-react';
import { useState } from 'react';
import type { CalculatorMaterial } from '../../../types/calculator.types';

interface MaterialsListProps {
  /** List of materials */
  materials: CalculatorMaterial[];
  
  /** Callback when quantity is updated */
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  
  /** Callback when material is removed */
  onRemove: (materialId: string) => void;
}

/**
 * Materials list component
 * Shows selected materials with ability to edit quantities and remove items
 */
export function MaterialsList({
  materials,
  onUpdateQuantity,
  onRemove,
}: MaterialsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalMaterials = materials.reduce((sum, m) => sum + m.subtotal, 0);

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Materiales Seleccionados
          </CardTitle>
          <CardDescription>
            No se han agregado materiales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Use el selector arriba para agregar materiales</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Materiales Seleccionados
        </CardTitle>
        <CardDescription>
          {materials.length} {materials.length === 1 ? 'material' : 'materiales'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Material info */}
              <div className="flex-grow">
                <div className="font-medium text-sm">{material.name}</div>
                <div className="text-xs text-gray-500">
                  ${material.unitPrice.toFixed(2)}/{material.unit}
                </div>
              </div>

              {/* Quantity editor */}
              <div className="flex items-center gap-2">
                {editingId === material.id ? (
                  <Input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => {
                      const newQty = parseFloat(e.target.value) || 0;
                      if (newQty > 0) {
                        onUpdateQuantity(material.id, newQty);
                      }
                    }}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingId(null);
                      }
                    }}
                    min="0.1"
                    step="0.1"
                    className="w-20 text-sm text-center"
                    autoFocus
                  />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(material.id)}
                    className="h-8 px-2"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    <span className="font-mono">
                      {material.quantity} {material.unit}
                    </span>
                  </Button>
                )}

                {/* Subtotal */}
                <div className="w-24 text-right font-bold text-sm">
                  ${material.subtotal.toFixed(2)}
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(material.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <span className="font-semibold text-gray-700">
              Total Materiales:
            </span>
            <span className="text-xl font-bold text-blue-700">
              ${totalMaterials.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
