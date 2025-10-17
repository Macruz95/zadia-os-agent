// src/modules/finance/validations/finance.validation.ts

import { z } from 'zod';

/**
 * Validación para estados de factura
 */
export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'partially-paid',
  'paid',
  'overdue',
  'cancelled',
]);

/**
 * Validación para métodos de pago
 */
export const paymentMethodSchema = z.enum([
  'cash',
  'bank-transfer',
  'credit-card',
  'debit-card',
  'check',
  'other',
]);

/**
 * Validación para estados de pago
 */
export const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'cancelled',
]);

/**
 * Esquema de validación para ítem de factura
 */
export const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  
  quantity: z
    .number()
    .min(0.01, 'La cantidad debe ser mayor a 0'),
  
  unitPrice: z
    .number()
    .min(0, 'El precio unitario no puede ser negativo'),
  
  discount: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .default(0),
  
  subtotal: z
    .number()
    .min(0, 'El subtotal no puede ser negativo'),
  
  unitOfMeasure: z
    .string()
    .min(1, 'La unidad de medida es obligatoria'),
});

/**
 * Esquema de validación para crear factura
 */
export const createInvoiceSchema = z.object({
  // Información básica
  number: z
    .string()
    .min(5, 'El número debe tener al menos 5 caracteres')
    .max(50, 'El número no puede exceder 50 caracteres')
    .regex(/^INV-\d{4}-\d+$/, 'Formato inválido. Use: INV-YYYY-NNN'),
  
  status: invoiceStatusSchema.default('draft'),
  
  // Relaciones
  clientId: z
    .string()
    .min(1, 'El cliente es obligatorio'),
  
  clientName: z
    .string()
    .min(1, 'El nombre del cliente es obligatorio'),
  
  quoteId: z.string().optional(),
  quoteNumber: z.string().optional(),
  projectId: z.string().optional(),
  
  // Ítems
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Debe incluir al menos un ítem'),
  
  // Montos
  subtotal: z
    .number()
    .min(0, 'El subtotal no puede ser negativo'),
  
  taxes: z
    .record(z.string(), z.number().min(0).max(100))
    .default({}),
  
  discounts: z
    .number()
    .min(0, 'Los descuentos no pueden ser negativos')
    .default(0),
  
  total: z
    .number()
    .min(0, 'El total no puede ser negativo'),
  
  currency: z
    .string()
    .length(3, 'La moneda debe ser un código de 3 letras')
    .default('USD'),
  
  // Fechas
  issueDate: z.date(),
  dueDate: z.date(),
  
  // Términos
  paymentTerms: z
    .string()
    .min(3, 'Los términos de pago son obligatorios')
    .max(500, 'Los términos no pueden exceder 500 caracteres'),
  
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  
  // Usuario
  createdBy: z
    .string()
    .min(1, 'El creador es obligatorio'),
});

/**
 * Esquema de validación para actualizar factura
 */
export const updateInvoiceSchema = createInvoiceSchema
  .partial()
  .omit({ number: true, createdBy: true });

/**
 * Esquema de validación para crear pago
 */
export const createPaymentSchema = z.object({
  // Factura
  invoiceId: z
    .string()
    .min(1, 'La factura es obligatoria'),
  
  invoiceNumber: z
    .string()
    .min(1, 'El número de factura es obligatorio'),
  
  // Cliente
  clientId: z
    .string()
    .min(1, 'El cliente es obligatorio'),
  
  clientName: z
    .string()
    .min(1, 'El nombre del cliente es obligatorio'),
  
  // Monto
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0'),
  
  currency: z
    .string()
    .length(3, 'La moneda debe ser un código de 3 letras')
    .default('USD'),
  
  // Método
  method: paymentMethodSchema,
  status: paymentStatusSchema.default('completed'),
  
  // Referencias
  reference: z
    .string()
    .max(100, 'La referencia no puede exceder 100 caracteres')
    .optional(),
  
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
  
  // Fecha
  paymentDate: z.date(),
  
  // Usuario
  recordedBy: z
    .string()
    .min(1, 'El usuario es obligatorio'),
  
  recordedByName: z
    .string()
    .min(1, 'El nombre del usuario es obligatorio'),
});

/**
 * Esquema de validación para actualizar pago
 */
export const updatePaymentSchema = createPaymentSchema
  .partial()
  .omit({ invoiceId: true, recordedBy: true });

/**
 * Esquema de validación para filtros de búsqueda
 */
export const invoiceFiltersSchema = z.object({
  clientId: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  projectId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  overdue: z.boolean().optional(),
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 */
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type InvoiceFiltersInput = z.infer<typeof invoiceFiltersSchema>;
