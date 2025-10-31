/**
 * ZADIA OS - Project Extensions Validations
 * Validaciones Zod para Work Sessions, Expenses, Documents
 * Rule #3: Zod validation required
 * Rule #5: Max 200 lines per file
 */

import { z } from 'zod';

// ============================================
// WORK SESSIONS
// ============================================

export const startWorkSessionSchema = z.object({
  projectId: z.string().min(1, 'ID del proyecto requerido'),
  workOrderId: z.string().optional(),
  taskId: z.string().optional(),
  userId: z.string().min(1, 'ID del usuario requerido'),
  userName: z.string().min(1, 'Nombre del usuario requerido'),
  hourlyRate: z.number().min(0, 'Tarifa horaria debe ser mayor o igual a 0').default(0),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

export const endWorkSessionSchema = z.object({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

export type StartWorkSessionInput = z.infer<typeof startWorkSessionSchema>;
export type EndWorkSessionInput = z.infer<typeof endWorkSessionSchema>;

// ============================================
// EXPENSES
// ============================================

export const expenseCategorySchema = z.enum([
  'materials',
  'labor',
  'overhead',
  'equipment',
  'transport',
  'subcontractor',
  'other',
]);

export const expenseStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'paid',
]);

export const createExpenseSchema = z.object({
  projectId: z.string().min(1, 'ID del proyecto requerido'),
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  category: expenseCategorySchema,
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0'),
  currency: z
    .string()
    .length(3, 'La moneda debe ser un código de 3 letras')
    .default('USD'),
  expenseDate: z.date(),
  receiptUrl: z.string().url('URL de comprobante inválida').optional(),
  receiptFileName: z.string().max(200).optional(),
  createdBy: z.string().min(1, 'Usuario creador requerido'),
  createdByName: z.string().min(1, 'Nombre del creador requerido'),
});

export const updateExpenseSchema = z.object({
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
  category: expenseCategorySchema.optional(),
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .optional(),
  expenseDate: z.date().optional(),
  receiptUrl: z.string().url('URL de comprobante inválida').optional(),
  receiptFileName: z.string().max(200).optional(),
});

export const approveExpenseSchema = z.object({
  approved: z.boolean(),
  approvedBy: z.string().min(1, 'Usuario aprobador requerido'),
  rejectionReason: z
    .string()
    .max(500, 'El motivo no puede exceder 500 caracteres')
    .optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;

// ============================================
// DOCUMENTS
// ============================================

export const documentTypeSchema = z.enum([
  'contract',
  'quote',
  'invoice',
  'technical-drawing',
  'photo',
  'report',
  'other',
]);

export const createDocumentSchema = z.object({
  projectId: z.string().min(1, 'ID del proyecto requerido'),
  name: z
    .string()
    .min(1, 'El nombre del archivo es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  documentType: documentTypeSchema,
  fileUrl: z.string().url('URL del archivo inválida'),
  fullPath: z.string().min(1, 'Ruta de almacenamiento requerida'),
  fileSize: z.number().positive('Tamaño de archivo debe ser mayor a 0'),
  fileType: z.string().min(1, 'Tipo MIME requerido'),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional(),
  uploadedBy: z.string().min(1, 'Usuario uploader requerido'),
  uploadedByName: z.string().min(1, 'Nombre del uploader requerido'),
});

export const updateDocumentSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del archivo es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  documentType: documentTypeSchema.optional(),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional(),
  version: z.string().max(20, 'Versión no puede exceder 20 caracteres').optional(),
  updatedBy: z.string().min(1, 'Usuario actualizador requerido').optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// ============================================
// TASKS (Extended)
// ============================================

export const taskStatusSchema = z.enum([
  'todo',
  'in-progress',
  'review',
  'done',
  'cancelled',
]);

export const taskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'ID del proyecto requerido'),
  workOrderId: z.string().optional(),
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  createdBy: z.string().min(1, 'Usuario creador requerido'),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
