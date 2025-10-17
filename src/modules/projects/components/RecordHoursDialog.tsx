// src/modules/projects/components/RecordHoursDialog.tsx

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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import type { WorkOrder } from '../types/projects.types';

interface RecordHoursDialogProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: (hours: number, notes?: string) => Promise<void>;
}

export function RecordHoursDialog({
  workOrder,
  open,
  onOpenChange,
  onRecord,
}: RecordHoursDialogProps) {
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setHours('');
      setNotes('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('Las horas deben ser mayores a 0');
      return;
    }

    if (hoursNum > 24) {
      setError('No se pueden registrar más de 24 horas por sesión');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRecord(hoursNum, notes || undefined);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message || 'Error al registrar horas');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!workOrder) return null;

  const laborCost = parseFloat(hours || '0') * workOrder.laborCostPerHour;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registrar Horas de Trabajo
          </DialogTitle>
          <DialogDescription>
            Orden: {workOrder.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Card */}
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo por hora:</span>
              <span className="font-medium">
                ${workOrder.laborCostPerHour.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas acumuladas:</span>
              <span className="font-medium">
                {workOrder.laborHours.toFixed(1)} h
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Costo laboral total:</span>
              <span className="font-medium">
                ${(workOrder.laborHours * workOrder.laborCostPerHour).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">
              Horas trabajadas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hours"
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0.0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Máximo 24 horas por registro
            </p>
          </div>

          {/* Preview del costo */}
          {parseFloat(hours) > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-900 dark:text-blue-100">
                  Costo de esta sesión:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${laborCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe el trabajo realizado..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/200 caracteres
            </p>
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
              Registrar Horas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
