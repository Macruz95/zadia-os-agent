// src/modules/projects/components/WorkOrderFormDialog.tsx

'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useWorkOrderForm } from '../hooks/use-work-order-form';
import type { CreateWorkOrderInput } from '../validations/work-orders.validation';

interface WorkOrderFormDialogProps {
  projectId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WorkOrderFormDialog({
  projectId,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: WorkOrderFormDialogProps) {
  const { isSubmitting, createWorkOrder } = useWorkOrderForm();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phase: '',
    assignedTo: userId,
    laborCostPerHour: 0,
    estimatedCost: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const workOrderData: CreateWorkOrderInput = {
        projectId,
        name: formData.name,
        description: formData.description || undefined,
        phase: formData.phase,
        status: 'pending',
        assignedTo: formData.assignedTo,
        materials: [],
        laborCostPerHour: formData.laborCostPerHour,
        estimatedCost: formData.estimatedCost,
        createdBy: userId,
      };

      await createWorkOrder(workOrderData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        phase: '',
        assignedTo: userId,
        laborCostPerHour: 0,
        estimatedCost: 0,
      });

      onOpenChange(false);
      onSuccess();
    } catch {
      // Error ya manejado por el hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          <DialogDescription>
            Crea una nueva orden para gestionar una fase del proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Corte de madera"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">
                Fase <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phase"
                value={formData.phase}
                onChange={(e) =>
                  setFormData({ ...formData, phase: e.target.value })
                }
                placeholder="Ej: Producción"
                required
                minLength={2}
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe los detalles de esta orden..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laborCostPerHour">Costo por Hora ($)</Label>
              <Input
                id="laborCostPerHour"
                type="number"
                step="0.01"
                min="0"
                value={formData.laborCostPerHour}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    laborCostPerHour: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Costo Estimado ($)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedCost: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Orden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
