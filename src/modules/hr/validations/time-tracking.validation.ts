/**
 * ZADIA OS - Time Tracking Validations
 * 
 * Zod schemas for time tracking data validation
 * REGLA #3: Validación estricta con Zod
 * REGLA #5: <200 líneas
 */

import { z } from 'zod';

/**
 * Work session status enum
 */
export const WorkSessionStatusSchema = z.enum(['active', 'paused', 'completed']);

/**
 * Time entry form schema
 */
export const TimeEntryFormSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  workOrderId: z.string().optional(),
  startTime: z.date({
    message: 'Hora de inicio requerida',
  }),
  endTime: z.date().optional(),
  activity: z.string().min(3, 'Actividad debe tener al menos 3 caracteres').max(200),
  notes: z.string().max(500, 'Notas no pueden exceder 500 caracteres').optional(),
  isBillable: z.boolean().default(true),
}).refine(
  (data) => !data.endTime || data.endTime > data.startTime,
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  }
);

/**
 * Work session creation schema
 */
export const CreateWorkSessionSchema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  taskId: z.string().optional(),
  taskName: z.string().optional(),
  workOrderId: z.string().optional(),
  activity: z.string().min(3).max(200),
  notes: z.string().max(500).optional(),
  isBillable: z.boolean().default(true),
  hourlyRate: z.number().min(0, 'Tarifa por hora debe ser positiva'),
});

/**
 * Work session update schema
 */
export const UpdateWorkSessionSchema = z.object({
  endTime: z.date().optional(),
  pausedDuration: z.number().min(0).optional(),
  activity: z.string().min(3).max(200).optional(),
  notes: z.string().max(500).optional(),
  status: WorkSessionStatusSchema.optional(),
});

/**
 * Work session filters schema
 */
export const WorkSessionFiltersSchema = z.object({
  employeeId: z.string().optional(),
  projectId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: WorkSessionStatusSchema.optional(),
  isBillable: z.boolean().optional(),
});

/**
 * Timer action schema
 */
export const TimerActionSchema = z.enum(['start', 'pause', 'resume', 'stop']);

// Export inferred types
export type TimeEntryFormData = z.infer<typeof TimeEntryFormSchema>;
export type CreateWorkSessionData = z.infer<typeof CreateWorkSessionSchema>;
export type UpdateWorkSessionData = z.infer<typeof UpdateWorkSessionSchema>;
export type WorkSessionFiltersData = z.infer<typeof WorkSessionFiltersSchema>;
export type TimerAction = z.infer<typeof TimerActionSchema>;
