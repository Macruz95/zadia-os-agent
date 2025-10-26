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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Package, Edit3, Check, X, Hammer, Box } from 'lucide-react';
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
          <Package className="w-5 h-5 mr-2 text-primary" />
          Materiales Seleccionados
        </CardTitle>
        <CardDescription>
          {materials.length} {materials.length === 1 ? 'material' : 'materiales'} • Total: ${totalMaterials.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Material</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{material.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ${material.unitPrice.toFixed(2)} por {material.unit}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {material.type === 'raw' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Hammer className="w-3 h-3" />
                      Materia Prima
                    </Badge>
                  ) : material.type === 'finished' ? (
                    <Badge variant="outline" className="gap-1">
                      <Box className="w-3 h-3" />
                      Producto
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Material</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === material.id ? (
                    <div className="flex items-center gap-1 justify-center">
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
                          if (e.key === 'Enter') setEditingId(null);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        min="0.01"
                        step="0.01"
                        className="w-20 text-center h-8"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(material.id)}
                      className="h-8 gap-1 mx-auto"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="font-mono text-sm">
                        {material.quantity} {material.unit}
                      </span>
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${material.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-bold text-primary">
                    ${material.subtotal.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(material.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total de {materials.length} {materials.length === 1 ? 'material' : 'materiales'}
            </div>
            <div className="text-2xl font-bold text-primary">
              ${totalMaterials.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
