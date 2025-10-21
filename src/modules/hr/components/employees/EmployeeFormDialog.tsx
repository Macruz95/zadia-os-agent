/**
 * ZADIA OS - Employee Form Dialog
 * 
 * Modal form for creating/editing employees
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 3: Zod validation
 * REGLA 5: <200 líneas
 * 
 * Refactored: Logic extracted to useEmployeeForm hook,
 * UI sections extracted to separate components
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EmployeeFormData } from '../../validations/hr.validation';
import type { Employee } from '../../types/hr.types';
import { useEmployeeForm } from '../../hooks/useEmployeeForm';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { EmploymentInfoSection } from './sections/EmploymentInfoSection';
import { CompensationSection } from './sections/CompensationSection';
import { EmergencyContactSection } from './sections/EmergencyContactSection';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  employee?: Employee;
}

export function EmployeeFormDialog({
  open,
  onClose,
  onSubmit,
  employee,
}: EmployeeFormDialogProps) {
  const { formData, errors, submitting, updateField, handleSubmit } =
    useEmployeeForm({
      employee,
      onSubmit,
      onClose,
    });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Editar' : 'Nuevo'} Empleado
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />

          <EmploymentInfoSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />

          <CompensationSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />

          <EmergencyContactSection
            formData={formData}
            updateField={updateField}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : employee ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
