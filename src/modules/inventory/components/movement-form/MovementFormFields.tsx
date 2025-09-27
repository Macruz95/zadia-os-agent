'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';

interface MovementFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  itemName: string;
  unit: string;
  currentUnitCost?: number;
}

export function MovementFormFields({ control, itemName, unit, currentUnitCost }: MovementFormFieldsProps) {
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

      {/* Unit Cost Field */}
      <FormField
        control={control}
        name="unitCost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Costo Unitario (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={currentUnitCost ? `Costo actual: $${currentUnitCost.toFixed(2)}` : "Ingrese el costo por unidad"}
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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