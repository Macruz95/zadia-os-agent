/**
 * ZADIA OS - Delete Lead Dialog Component
 * 
 * Confirmation dialog for deleting leads
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  leadName: string;
}

export function DeleteLeadDialog({
  open,
  onOpenChange,
  onConfirm,
  leadName,
}: DeleteLeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Eliminar Lead</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que deseas eliminar el lead <strong>{leadName}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos relacionados con este lead.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Eliminar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}