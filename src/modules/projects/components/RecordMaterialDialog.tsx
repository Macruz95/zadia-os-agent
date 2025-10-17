// src/modules/projects/components/RecordMaterialDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Package } from 'lucide-react';
import type { WorkOrder } from '../types/projects.types';

interface RecordMaterialDialogProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: (materialId: string, quantity: number) => Promise<void>;
}

export function RecordMaterialDialog({
  workOrder,
  open,
  onOpenChange,
  onRecord,
}: RecordMaterialDialogProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedMaterial = workOrder?.materials.find(
    (m) => m.rawMaterialId === selectedMaterialId
  );

  const remaining = selectedMaterial
    ? selectedMaterial.quantityRequired - selectedMaterial.quantityUsed
    : 0;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMaterialId('');
      setQuantity('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMaterialId) {
      setError('Selecciona un material');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (quantityNum > remaining) {
      setError(`La cantidad excede lo disponible (${remaining} ${selectedMaterial?.unitOfMeasure})`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onRecord(selectedMaterialId, quantityNum);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message || 'Error al registrar material');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!workOrder) return null;

  const availableMaterials = workOrder.materials.filter(
    (m) => m.quantityUsed < m.quantityRequired
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Consumo de Material
          </DialogTitle>
          <DialogDescription>
            Orden: {workOrder.name}
          </DialogDescription>
        </DialogHeader>

        {availableMaterials.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Todos los materiales de esta orden ya han sido consumidos completamente.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="material">
                Material <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedMaterialId}
                onValueChange={setSelectedMaterialId}
              >
                <SelectTrigger id="material">
                  <SelectValue placeholder="Selecciona un material" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials.map((material) => {
                    const remaining = material.quantityRequired - material.quantityUsed;
                    return (
                      <SelectItem
                        key={material.rawMaterialId}
                        value={material.rawMaterialId}
                      >
                        {material.rawMaterialName} - {remaining.toFixed(2)}{' '}
                        {material.unitOfMeasure} disponibles
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedMaterial && (
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requerido:</span>
                  <span className="font-medium">
                    {selectedMaterial.quantityRequired} {selectedMaterial.unitOfMeasure}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ya usado:</span>
                  <span className="font-medium">
                    {selectedMaterial.quantityUsed} {selectedMaterial.unitOfMeasure}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Disponible:</span>
                  <span className="font-medium text-green-600">
                    {remaining.toFixed(2)} {selectedMaterial.unitOfMeasure}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Cantidad a usar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                max={remaining}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                required
                disabled={!selectedMaterialId}
              />
              {selectedMaterial && (
                <p className="text-xs text-muted-foreground">
                  Unidad: {selectedMaterial.unitOfMeasure}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedMaterialId}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Consumo
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
