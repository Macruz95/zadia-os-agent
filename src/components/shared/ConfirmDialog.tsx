/**
 * ZADIA OS - ConfirmDialog Component
 * 
 * Diálogo de confirmación reutilizable
 * Reemplaza los AlertDialogs inline duplicados en el sistema
 * 
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  /** Controla si el diálogo está abierto */
  open: boolean;
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void;
  /** Título del diálogo */
  title: string;
  /** Descripción/mensaje del diálogo */
  description: string | ReactNode;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Texto del botón de confirmar */
  confirmText?: string;
  /** Callback cuando se confirma */
  onConfirm: () => void;
  /** Variante del botón de confirmación */
  variant?: 'default' | 'destructive';
  /** Si está cargando/procesando */
  loading?: boolean;
}

/**
 * ConfirmDialog - Diálogo de confirmación unificado
 * 
 * @example
 * // Eliminar
 * <ConfirmDialog
 *   open={deleteOpen}
 *   onOpenChange={setDeleteOpen}
 *   title="¿Eliminar empleado?"
 *   description="Esta acción marcará al empleado como inactivo."
 *   confirmText="Eliminar"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * />
 * 
 * @example
 * // Confirmar acción
 * <ConfirmDialog
 *   open={confirmOpen}
 *   onOpenChange={setConfirmOpen}
 *   title="¿Confirmar envío?"
 *   description="Se enviará la factura al cliente por email."
 *   confirmText="Enviar"
 *   onConfirm={handleSend}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  onConfirm,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild={typeof description !== 'string'}>
            {typeof description === 'string' ? description : <div>{description}</div>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === 'destructive' && 
                'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {loading ? 'Procesando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * DeleteConfirmDialog - Versión preconfigurada para eliminación
 */
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  loading?: boolean;
  /** Si es soft delete (marcar como inactivo) o hard delete (eliminar permanentemente) */
  softDelete?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType = 'elemento',
  onConfirm,
  loading = false,
  softDelete = false,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`¿Eliminar ${itemType}?`}
      description={
        softDelete
          ? `Esta acción marcará a ${itemName} como inactivo. No se eliminará permanentemente de la base de datos.`
          : `Esta acción eliminará permanentemente a ${itemName}. Esta operación no se puede deshacer.`
      }
      cancelText="Cancelar"
      confirmText="Eliminar"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}
