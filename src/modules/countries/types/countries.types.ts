import { z } from 'zod';

// Country validation schema
export const countrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del país es requerido'),
  isoCode: z.string().length(2, 'El código ISO debe tener 2 caracteres').toUpperCase(),
  phoneCode: z.string().regex(/^\+\d+$/, 'El código de teléfono debe empezar con + y contener solo números'),
  flagEmoji: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Export type from schema
export type Country = z.infer<typeof countrySchema>;