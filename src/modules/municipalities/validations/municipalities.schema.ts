import { z } from 'zod';

// Municipality form validation schema
export const municipalityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del municipio es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  code: z
    .string()
    .max(10, 'El código no puede exceder 10 caracteres')
    .optional(),
  departmentId: z
    .string()
    .min(1, 'Debe seleccionar un departamento'),
  postalCode: z
    .string()
    .max(10, 'El código postal no puede exceder 10 caracteres')
    .optional(),
  latitude: z
    .number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .optional(),
  isActive: z.boolean()
});

// Municipality search validation schema
export const municipalitySearchSchema = z.object({
  query: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Export types from schemas
export type MunicipalityFormData = z.infer<typeof municipalityFormSchema>;
export type MunicipalitySearchData = z.infer<typeof municipalitySearchSchema>;