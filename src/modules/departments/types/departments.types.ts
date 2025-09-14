import { z } from 'zod';

// Department validation schema
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del departamento es requerido'),
  countryId: z.string().min(1, 'El ID del país es requerido'),
  code: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Export type from schema
export type Department = z.infer<typeof departmentSchema>;