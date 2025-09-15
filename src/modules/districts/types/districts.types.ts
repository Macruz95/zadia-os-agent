import { z } from 'zod';

// District validation schema
export const districtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del distrito es requerido'),
  municipalityId: z.string().min(1, 'El ID del municipio es requerido'),
  isActive: z.boolean().default(true)
});

// Export type from schema
export type District = z.infer<typeof districtSchema>;