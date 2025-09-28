/**
 * ZADIA OS - BOM Basic Info Component
 * 
 * Form fields for version, labor hours, and cost information
 */

import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { BillOfMaterialsFormData } from '../../validations/inventory.schema';

interface BOMBasicInfoProps {
  control: Control<BillOfMaterialsFormData>;
}

export function BOMBasicInfo({ control }: BOMBasicInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="version"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Versión *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                step="1"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estimatedLaborHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horas de Trabajo Estimadas *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="laborCostPerHour"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Costo por Hora de Trabajo *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="overheadPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gastos Indirectos (%) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}