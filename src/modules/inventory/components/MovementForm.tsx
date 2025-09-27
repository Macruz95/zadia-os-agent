'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { createMovement } from '../services/inventory.service';
import { RawMaterial, FinishedProduct } from '../types';
import { MovementTypeSelector } from './movement-form/MovementTypeSelector';
import { MovementFormFields } from './movement-form/MovementFormFields';
import { StockPreview } from './movement-form/StockPreview';

// Schema específico para el formulario de movimientos
const movementFormSchema = z.object({
  itemId: z.string().min(1, 'ID del artículo es requerido'),
  itemType: z.enum(['raw-material', 'finished-product']),
  movementType: z.enum(['Entrada', 'Salida', 'Ajuste', 'Merma', 'Produccion', 'Venta', 'Devolucion']),
  quantity: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0'),
  unitCost: z.number().min(0, 'Costo unitario no puede ser negativo'),
  reason: z.string().optional(),
  performedBy: z.string().min(1, 'Usuario que realiza el movimiento es requerido'),
});

type MovementFormInput = z.infer<typeof movementFormSchema>;

interface MovementFormProps {
  item: RawMaterial | FinishedProduct;
  itemType: 'raw-material' | 'finished-product';
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function MovementForm({ item, itemType, onSuccess, trigger }: MovementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getItemUnit = (item: RawMaterial | FinishedProduct): string => {
    if ('unitOfMeasure' in item) {
      return item.unitOfMeasure;
    }
    return 'unidades';
  };

  const getCurrentUnitCost = (): number => {
    if (itemType === 'raw-material') {
      return (item as RawMaterial).unitCost;
    } else {
      // Para productos terminados, usar costo de materiales + labor + overhead
      const finishedProduct = item as FinishedProduct;
      return (finishedProduct.laborCost || 0) + (finishedProduct.overheadCost || 0);
    }
  };

  const form = useForm<MovementFormInput>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      itemId: item.id,
      itemType,
      movementType: 'Entrada',
      quantity: 1,
      unitCost: getCurrentUnitCost(),
      reason: '',
      performedBy: '',
    },
  });

  const watchedMovementType = form.watch('movementType');
  const watchedQuantity = form.watch('quantity');
  const watchedUnitCost = form.watch('unitCost');

  const onSubmit = async (data: MovementFormInput) => {
    setLoading(true);
    
    try {
      await createMovement({
        itemId: data.itemId,
        itemType: data.itemType,
        movementType: data.movementType,
        quantity: data.quantity,
        unitCost: data.unitCost,
        reason: data.reason,
        performedBy: data.performedBy,
      });
      
      toast.success(`Se ha registrado el movimiento de ${data.movementType.toLowerCase()} correctamente.`);
      
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Movimiento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-full max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] mx-4">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            Registrar Movimiento de Inventario
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Information Header */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Artículo Seleccionado</h4>
              <p className="text-blue-700 text-sm">{item.name}</p>
              <p className="text-blue-600 text-xs">SKU: {item.sku} | Stock actual: {item.currentStock} {getItemUnit(item)}</p>
            </div>

            {/* Movement Type Selector */}
            <MovementTypeSelector 
              control={form.control}
              selectedType={watchedMovementType}
            />

            {/* Form Fields */}
            <MovementFormFields
              control={form.control}
              itemName={item.name}
              unit={getItemUnit(item)}
              currentUnitCost={getCurrentUnitCost()}
            />

            {/* Stock Preview */}
            <StockPreview
              item={item}
              itemType={itemType}
              quantity={watchedQuantity}
              movementType={watchedMovementType}
              unitCost={watchedUnitCost}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Movimiento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}