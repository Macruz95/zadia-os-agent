'use client';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowUp, ArrowDown, RotateCcw, Minus, Package, ShoppingCart, Undo } from 'lucide-react';
import { Control } from 'react-hook-form';

const movementTypes = [
  { value: 'Entrada', label: 'Entrada', icon: ArrowUp, color: 'text-green-600' },
  { value: 'Salida', label: 'Salida', icon: ArrowDown, color: 'text-red-600' },
  { value: 'Ajuste', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600' },
  { value: 'Merma', label: 'Merma', icon: Minus, color: 'text-orange-600' },
  { value: 'Produccion', label: 'Producción', icon: Package, color: 'text-purple-600' },
  { value: 'Venta', label: 'Venta', icon: ShoppingCart, color: 'text-indigo-600' },
  { value: 'Devolucion', label: 'Devolución', icon: Undo, color: 'text-yellow-600' },
] as const;

type MovementFormValues = {
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  movementType: 'Entrada' | 'Salida' | 'Ajuste' | 'Merma' | 'Produccion' | 'Venta' | 'Devolucion';
  quantity: number;
  reason?: string;
  performedBy: string;
};

interface MovementTypeSelectorProps {
  control: Control<MovementFormValues>;
  selectedType: string;
}

export function MovementTypeSelector({ control, selectedType }: MovementTypeSelectorProps) {
  const selectedMovementType = movementTypes.find(type => type.value === selectedType);

  return (
    <FormField
      control={control}
      name="movementType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Movimiento</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de movimiento" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {movementTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${type.color}`} />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedMovementType && (
            <Badge variant="outline" className="mt-2">
              <selectedMovementType.icon className={`h-3 w-3 mr-1 ${selectedMovementType.color}`} />
              {selectedMovementType.label}
            </Badge>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}