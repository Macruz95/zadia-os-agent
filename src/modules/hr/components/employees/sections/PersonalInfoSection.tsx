/**
 * ZADIA OS - Personal Info Section
 * 
 * Personal information fields for employee form
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/modules/clients/components/form/PhoneInput';
import type { EmployeeFormData } from '../../../validations/hr.validation';

interface PersonalInfoSectionProps {
  formData: EmployeeFormData;
  errors: Record<string, string>;
  updateField: (field: string, value: unknown) => void;
}

export function PersonalInfoSection({
  formData,
  errors,
  updateField,
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <User className="h-4 w-4" />
        Información Personal
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com (opcional)"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <PhoneInput
            value={formData.phone}
            countryCode={formData.phoneCountryId || 'SV'}
            onChange={(phone, countryCode) => {
              updateField('phone', phone);
              updateField('phoneCountryId', countryCode);
            }}
            label="Teléfono"
            required
            error={errors.phone}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">DUI / Cédula</Label>
          <Input
            id="nationalId"
            placeholder="Opcional para empleados extranjeros"
            value={formData.nationalId || ''}
            onChange={(e) => updateField('nationalId', e.target.value)}
          />
          {errors.nationalId && (
            <p className="text-sm text-destructive">{errors.nationalId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">NIT</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Dirección *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            rows={2}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
