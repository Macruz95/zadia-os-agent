/**
 * ZADIA OS - Emergency Contact Section
 * 
 * Emergency contact fields for employee form
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/modules/clients/components/form/PhoneInput';
import type { EmployeeFormData } from '../../../validations/hr.validation';

interface EmergencyContactSectionProps {
  formData: EmployeeFormData;
  updateField: (field: string, value: unknown) => void;
}

export function EmergencyContactSection({
  formData,
  updateField,
}: EmergencyContactSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Phone className="h-4 w-4" />
        Contacto de Emergencia
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Nombre</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName || ''}
            onChange={(e) => updateField('emergencyContactName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <PhoneInput
            value={formData.emergencyContactPhone || ''}
            countryCode={formData.emergencyContactPhoneCountryId || 'SV'}
            onChange={(phone, countryCode) => {
              updateField('emergencyContactPhone', phone);
              updateField('emergencyContactPhoneCountryId', countryCode);
            }}
            label="Teléfono"
            required={false}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContactRelation">Relación</Label>
          <Input
            id="emergencyContactRelation"
            value={formData.emergencyContactRelation || ''}
            onChange={(e) => updateField('emergencyContactRelation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
