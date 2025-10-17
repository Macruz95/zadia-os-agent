// src/modules/projects/validations/work-orders.validation.ts

import { z } from 'zod';

/**
 * Validación para estados de orden de trabajo
 */
export const workOrderStatusSchema = z.enum([
  'pending',
  'in-progress',
  'paused',
  'completed',
  'cancelled',
]);

/**
 * Esquema de validación para material en orden de trabajo
 */
export const workOrderMaterialSchema = z.object({
  rawMaterialId: z
    .string()
    .min(1, 'El ID del material es obligatorio'),
  
  rawMaterialName: z
    .string()
    .min(1, 'El nombre del material es obligatorio'),
  
  quantityRequired: z
    .number()
    .min(0, 'La cantidad requerida no puede ser negativa'),
  
  quantityUsed: z
    .number()
    .min(0, 'La cantidad usada no puede ser negativa')
    .default(0),
  
  unitOfMeasure: z
    .string()
    .min(1, 'La unidad de medida es obligatoria'),
  
  unitCost: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo'),
  
  totalCost: z
    .number()
    .min(0, 'El costo total no puede ser negativo')
    .default(0),
});

/**
 * Esquema de validación para crear una orden de trabajo
 */
export const createWorkOrderSchema = z.object({
  projectId: z
    .string()
    .min(1, 'El ID del proyecto es obligatorio'),
  
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  phase: z
    .string()
    .min(2, 'La fase debe tener al menos 2 caracteres')
    .max(50, 'La fase no puede exceder 50 caracteres'),
  
  status: workOrderStatusSchema.default('pending'),
  
  assignedTo: z
    .string()
    .min(1, 'El responsable es obligatorio'),
  
  estimatedStartDate: z.date().optional(),
  
  estimatedEndDate: z.date().optional(),
  
  materials: z
    .array(workOrderMaterialSchema)
    .default([]),
  
  laborCostPerHour: z
    .number()
    .min(0, 'El costo por hora no puede ser negativo')
    .default(0),
  
  estimatedCost: z
    .number()
    .min(0, 'El costo estimado no puede ser negativo')
    .default(0),
  
  createdBy: z
    .string()
    .min(1, 'El creador es obligatorio'),
});

/**
 * Esquema de validación para actualizar orden de trabajo
 */
export const updateWorkOrderSchema = createWorkOrderSchema
  .partial()
  .omit({ projectId: true, createdBy: true });

/**
 * Esquema para registrar consumo de material
 */
export const recordMaterialConsumptionSchema = z.object({
  workOrderId: z
    .string()
    .min(1, 'El ID de la orden es obligatorio'),
  
  rawMaterialId: z
    .string()
    .min(1, 'El ID del material es obligatorio'),
  
  quantityUsed: z
    .number()
    .min(0.01, 'La cantidad debe ser mayor a 0'),
  
  userId: z
    .string()
    .min(1, 'El usuario es obligatorio'),
  
  userName: z
    .string()
    .min(1, 'El nombre del usuario es obligatorio'),
});

/**
 * Esquema para registrar horas de trabajo
 */
export const recordLaborHoursSchema = z.object({
  workOrderId: z
    .string()
    .min(1, 'El ID de la orden es obligatorio'),
  
  hours: z
    .number()
    .min(0.1, 'Las horas deben ser mayores a 0')
    .max(24, 'No se pueden registrar más de 24 horas'),
  
  userId: z
    .string()
    .min(1, 'El usuario es obligatorio'),
  
  userName: z
    .string()
    .min(1, 'El nombre del usuario es obligatorio'),
  
  notes: z
    .string()
    .max(200, 'Las notas no pueden exceder 200 caracteres')
    .optional(),
});

/**
 * Esquema para cambiar estado de orden de trabajo
 */
export const changeWorkOrderStatusSchema = z.object({
  workOrderId: z
    .string()
    .min(1, 'El ID de la orden es obligatorio'),
  
  newStatus: workOrderStatusSchema,
  
  userId: z
    .string()
    .min(1, 'El usuario es obligatorio'),
  
  userName: z
    .string()
    .min(1, 'El nombre del usuario es obligatorio'),
  
  notes: z
    .string()
    .max(200, 'Las notas no pueden exceder 200 caracteres')
    .optional(),
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 */
export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type RecordMaterialConsumptionInput = z.infer<typeof recordMaterialConsumptionSchema>;
export type RecordLaborHoursInput = z.infer<typeof recordLaborHoursSchema>;
export type ChangeWorkOrderStatusInput = z.infer<typeof changeWorkOrderStatusSchema>;
export type WorkOrderMaterialInput = z.infer<typeof workOrderMaterialSchema>;
