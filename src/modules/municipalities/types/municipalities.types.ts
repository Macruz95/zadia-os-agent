import { z } from 'zod';

// Municipality validation schema
export const municipalitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del municipio es requerido'),
  code: z.string().optional(),
  departmentId: z.string().min(1, 'El ID del departamento es requerido'),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().default(true)
});

// Export type from schema
export type Municipality = z.infer<typeof municipalitySchema>;