import { z } from 'zod';

// Country form validation schema
export const countryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del país es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  isoCode: z
    .string()
    .length(2, 'El código ISO debe tener exactamente 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'El código ISO debe contener solo letras mayúsculas')
    .toUpperCase(),
  phoneCode: z
    .string()
    .min(2, 'El código de teléfono es requerido')
    .regex(/^\+\d{1,4}$/, 'El código de teléfono debe empezar con + seguido de 1-4 dígitos'),
  flagEmoji: z
    .string()
    .optional()
    .refine(val => !val || /\p{Emoji}/u.test(val), 'Debe ser un emoji válido')
});

// Country search validation schema
export const countrySearchSchema = z.object({
  query: z.string().optional(),
  isActive: z.boolean().optional()
});

// Export types from schemas
export type CountryFormData = z.infer<typeof countryFormSchema>;
export type CountrySearchData = z.infer<typeof countrySearchSchema>;