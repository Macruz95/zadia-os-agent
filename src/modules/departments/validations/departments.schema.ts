import { z } from 'zod';

// Department form validation schema
export const departmentFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del departamento es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  countryId: z
    .string()
    .min(1, 'Debe seleccionar un país'),
  code: z
    .string()
    .max(10, 'El código no puede exceder 10 caracteres')
    .optional(),
  isActive: z.boolean()
});

// Department search validation schema
export const departmentSearchSchema = z.object({
  query: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Export types from schemas
export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
export type DepartmentSearchData = z.infer<typeof departmentSearchSchema>;