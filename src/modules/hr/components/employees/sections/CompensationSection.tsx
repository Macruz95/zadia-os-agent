/**
 * ZADIA OS - Compensation Section
 * 
 * Salary and compensation fields for employee form
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmployeeFormData } from '../../../validations/hr.validation';

interface CompensationSectionProps {
  formData: EmployeeFormData;
  errors: Record<string, string>;
  updateField: (field: string, value: unknown) => void;
}

export function CompensationSection({
  formData,
  errors,
  updateField,
}: CompensationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <DollarSign className="h-4 w-4" />
        Compensación
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salario *</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            value={formData.salary ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              updateField('salary', val === '' ? 0 : parseFloat(val));
            }}
          />
          {errors.salary && (
            <p className="text-sm text-destructive">{errors.salary}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda *</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => updateField('currency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="MXN">MXN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentFrequency">Frecuencia *</Label>
          <Select
            value={formData.paymentFrequency}
            onValueChange={(value) => updateField('paymentFrequency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Por Hora</SelectItem>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="biweekly">Quincenal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
