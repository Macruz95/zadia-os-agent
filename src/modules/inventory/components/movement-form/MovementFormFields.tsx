'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';

type MovementFormValues = {
  itemId: string;
  itemType: 'raw-material' | 'finished-product';
  movementType: 'Entrada' | 'Salida' | 'Ajuste' | 'Merma' | 'Produccion' | 'Venta' | 'Devolucion';
  quantity: number;
  reason?: string;
  performedBy: string;
};

interface MovementFormFieldsProps {
  control: Control<MovementFormValues>;
  itemName: string;
  unit: string;
}

export function MovementFormFields({ control, itemName, unit }: MovementFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Item Information */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-1">Artículo Seleccionado</h4>
        <p className="text-blue-700 text-sm">{itemName}</p>
      </div>

      {/* Quantity Field */}
      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cantidad ({unit})</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder={`Ingrese la cantidad en ${unit}`}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Reason Field */}
      <FormField
        control={control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe el motivo del movimiento..."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Performed By Field */}
      <FormField
        control={control}
        name="performedBy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Realizado por</FormLabel>
            <FormControl>
              <Input
                placeholder="Nombre del usuario que realiza el movimiento"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}