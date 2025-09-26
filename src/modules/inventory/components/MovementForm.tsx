'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, RotateCcw, Minus, Package, ShoppingCart, Undo, Plus } from 'lucide-react';
import { MovementFormData } from '../types';
import { createMovement } from '../services/inventory.service';
import { RawMaterial, FinishedProduct } from '../types';

// Schema específico para el formulario de movimientos
const movementFormSchema = z.object({
  itemId: z.string().min(1, 'ID del artículo es requerido'),
  itemType: z.enum(['raw-material', 'finished-product']),
  movementType: z.enum(['Entrada', 'Salida', 'Ajuste', 'Merma', 'Produccion', 'Venta', 'Devolucion']),
  quantity: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0'),
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

const movementTypes = [
  { value: 'Entrada', label: 'Entrada', icon: ArrowUp, color: 'text-green-600' },
  { value: 'Salida', label: 'Salida', icon: ArrowDown, color: 'text-red-600' },
  { value: 'Ajuste', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600' },
  { value: 'Merma', label: 'Merma', icon: Minus, color: 'text-orange-600' },
  { value: 'Produccion', label: 'Producción', icon: Package, color: 'text-purple-600' },
  { value: 'Venta', label: 'Venta', icon: ShoppingCart, color: 'text-indigo-600' },
  { value: 'Devolucion', label: 'Devolución', icon: Undo, color: 'text-yellow-600' },
] as const;

export function MovementForm({ item, itemType, onSuccess, trigger }: MovementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getItemUnit = (item: RawMaterial | FinishedProduct): string => {
    if ('unitOfMeasure' in item) {
      return item.unitOfMeasure;
    }
    return 'unidades'; // Default para productos terminados
  };

  const form = useForm<MovementFormInput>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      itemId: item.id,
      itemType,
      movementType: 'Entrada',
      quantity: 1,
      reason: '',
      performedBy: '', // Se debe llenar automáticamente con el usuario actual
    },
  });

  const watchedMovementType = form.watch('movementType');
  const watchedQuantity = form.watch('quantity');

  const onSubmit = async (data: MovementFormInput) => {
    setLoading(true);
    
    try {
      await createMovement({
        itemId: data.itemId,
        itemType: data.itemType,
        movementType: data.movementType,
        quantity: data.quantity,
        reason: data.reason,
      }, data.performedBy);
      
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

  const calculateNewStock = () => {
    const currentStock = item.currentStock;
    const quantity = watchedQuantity || 0;
    
    switch (watchedMovementType) {
      case 'Entrada':
      case 'Devolucion':
        return currentStock + quantity;
      case 'Salida':
      case 'Merma':
      case 'Venta':
      case 'Produccion':
        return Math.max(0, currentStock - quantity);
      case 'Ajuste':
        return quantity; // Para ajustes, la cantidad es el nuevo stock
      default:
        return currentStock;
    }
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find(mt => mt.value === type);
  };

  const selectedMovementType = getMovementTypeInfo(watchedMovementType);

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{item.name}</span>
            <Badge variant="outline">{item.sku}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Stock actual: <span className="font-medium">{item.currentStock} {getItemUnit(item)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="movementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimiento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movementTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedMovementType === 'Ajuste' ? 'Nuevo Stock' : 'Cantidad'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {getItemUnit(item)}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Previsualización del nuevo stock */}
            <div className="p-3 border rounded-lg bg-background">
              <div className="flex items-center justify-between text-sm">
                <span>Stock resultante:</span>
                <div className="flex items-center gap-2">
                  {selectedMovementType && (
                    <selectedMovementType.icon 
                      className={`h-4 w-4 ${selectedMovementType.color}`} 
                    />
                  )}
                  <span className="font-medium">
                    {calculateNewStock()} {getItemUnit(item)}
                  </span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el motivo del movimiento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Realizado por</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Usuario que realiza el movimiento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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