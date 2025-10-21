/**
 * ZADIA OS - Employment Info Section
 * 
 * Employment details fields for employee form
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { POSITION_CONFIG, CONTRACT_TYPE_CONFIG } from '../../../types/hr.types';
import type { EmployeeFormData } from '../../../validations/hr.validation';

interface EmploymentInfoSectionProps {
  formData: EmployeeFormData;
  errors: Record<string, string>;
  updateField: (field: string, value: unknown) => void;
}

export function EmploymentInfoSection({
  formData,
  errors,
  updateField,
}: EmploymentInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Briefcase className="h-4 w-4" />
        Información Laboral
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Posición *</Label>
          <Select
            value={formData.position}
            onValueChange={(value) => updateField('position', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POSITION_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departamento *</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => updateField('department', e.target.value)}
          />
          {errors.department && (
            <p className="text-sm text-destructive">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractType">Tipo Contrato *</Label>
          <Select
            value={formData.contractType}
            onValueChange={(value) => updateField('contractType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_TYPE_CONFIG).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateField('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="suspended">Suspendido</SelectItem>
              <SelectItem value="vacation">De Vacaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
