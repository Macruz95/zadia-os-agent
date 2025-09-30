import { z } from 'zod';

// Phone code validation schema
export const phoneCodeSchema = z.object({
  id: z.string(),
  countryId: z.string().min(1, 'El ID del país es requerido'),
  code: z.string().min(1, 'El código telefónico es requerido'),
  dialCode: z.string().min(1, 'El código de marcado es requerido'),
  format: z.string().optional(), // Format pattern like "+1 (###) ###-####"
  example: z.string().optional(), // Example number
  priority: z.number().default(1), // Priority for countries with multiple codes
  isActive: z.boolean().default(true)
});

// Phone number validation schema
export const phoneNumberSchema = z.object({
  countryId: z.string().min(1, 'Debe seleccionar un país'),
  phoneCode: z.string().min(1, 'El código telefónico es requerido'),
  number: z.string().min(1, 'El número telefónico es requerido'),
  fullNumber: z.string().optional(), // Complete formatted number
  isValid: z.boolean().default(false)
});

// Export types from schemas
export type PhoneCode = z.infer<typeof phoneCodeSchema>;
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;