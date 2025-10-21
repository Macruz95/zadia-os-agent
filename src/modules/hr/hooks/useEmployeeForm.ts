/**
 * ZADIA OS - Employee Form Hook
 * 
 * Custom hook for employee form state management and validation
 * REGLA 3: Zod validation
 * REGLA 5: <200 líneas
 * 
 * Extracted from EmployeeFormDialog to reduce component complexity
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  employeeFormSchema,
  type EmployeeFormData,
} from '../validations/hr.validation';
import type { Employee } from '../types/hr.types';

interface UseEmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onClose: () => void;
}

interface UseEmployeeFormReturn {
  formData: EmployeeFormData;
  errors: Record<string, string>;
  submitting: boolean;
  updateField: (field: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Initialize form data from employee or defaults
 */
function getInitialFormData(employee?: Employee): EmployeeFormData {
  if (!employee) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthDate: new Date(),
      nationalId: '',
      taxId: '',
      position: 'carpenter',
      department: '',
      status: 'active',
      contractType: 'permanent',
      hireDate: new Date(),
      salary: 0,
      currency: 'USD',
      paymentFrequency: 'monthly',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    };
  }

  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    address: employee.address,
    birthDate: employee.birthDate.toDate(),
    nationalId: employee.nationalId,
    taxId: employee.taxId,
    position: employee.position,
    department: employee.department,
    status: employee.status,
    contractType: employee.contractType,
    hireDate: employee.hireDate.toDate(),
    salary: employee.salary,
    currency: employee.currency,
    paymentFrequency: employee.paymentFrequency,
    emergencyContactName: employee.emergencyContactName || '',
    emergencyContactPhone: employee.emergencyContactPhone || '',
    emergencyContactRelation: employee.emergencyContactRelation || '',
  };
}

/**
 * Custom hook for employee form management
 */
export function useEmployeeForm({
  employee,
  onSubmit,
  onClose,
}: UseEmployeeFormProps): UseEmployeeFormReturn {
  const [formData, setFormData] = useState<EmployeeFormData>(() =>
    getInitialFormData(employee)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  /**
   * Update a single field and clear its error
   */
  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validate and submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = employeeFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
      toast.success(
        employee ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente'
      );
      onClose();
    } catch {
      toast.error('Error al guardar empleado');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    submitting,
    updateField: updateField as (field: string, value: unknown) => void,
    handleSubmit,
  };
}
