import { z } from 'zod';

// District form validation schema
export const districtFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del distrito es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  municipalityId: z
    .string()
    .min(1, 'Debe seleccionar un municipio'),
  code: z
    .string()
    .max(10, 'El código no puede exceder 10 caracteres')
    .optional()
});

// District search validation schema
export const districtSearchSchema = z.object({
  query: z.string().optional(),
  municipalityId: z.string().optional(),
  departmentId: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Export types from schemas
export type DistrictFormData = z.infer<typeof districtFormSchema>;
export type DistrictSearchData = z.infer<typeof districtSearchSchema>;