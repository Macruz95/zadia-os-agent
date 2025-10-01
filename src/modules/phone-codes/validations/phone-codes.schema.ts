import { z } from 'zod';

// Phone code form validation schema
export const phoneCodeFormSchema = z.object({
  countryId: z
    .string()
    .min(1, 'Debe seleccionar un país'),
  code: z
    .string()
    .min(1, 'El código telefónico es requerido')
    .max(10, 'El código no puede exceder 10 caracteres')
    .regex(/^\+\d+$/, 'El código debe comenzar con + seguido de números'),
  dialCode: z
    .string()
    .min(1, 'El código de marcado es requerido')
    .max(10, 'El código de marcado no puede exceder 10 caracteres')
    .regex(/^\d+$/, 'El código de marcado debe contener solo números'),
  format: z
    .string()
    .max(50, 'El formato no puede exceder 50 caracteres')
    .optional(),
  example: z
    .string()
    .max(30, 'El ejemplo no puede exceder 30 caracteres')
    .optional(),
  priority: z
    .number()
    .min(1, 'La prioridad debe ser al menos 1')
    .max(10, 'La prioridad no puede exceder 10')
});

// Phone number validation schema
export const phoneNumberFormSchema = z.object({
  countryId: z
    .string()
    .min(1, 'Debe seleccionar un país'),
  phoneCode: z
    .string()
    .min(1, 'El código telefónico es requerido'),
  number: z
    .string()
    .min(1, 'El número telefónico es requerido')
    .regex(/^[0-9\s\-\(\)\+]+$/, 'El número contiene caracteres inválidos')
});

// Phone code search validation schema
export const phoneCodeSearchSchema = z.object({
  query: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Export types from schemas
export type PhoneCodeFormData = z.infer<typeof phoneCodeFormSchema>;
export type PhoneNumberFormData = z.infer<typeof phoneNumberFormSchema>;
export type PhoneCodeSearchData = z.infer<typeof phoneCodeSearchSchema>;