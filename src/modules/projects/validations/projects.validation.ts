// src/modules/projects/validations/projects.validation.ts

import { z } from 'zod';

/**
 * Validación para estados del proyecto
 */
export const projectStatusSchema = z.enum([
  'planning',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled',
]);

/**
 * Validación para prioridades
 */
export const projectPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

/**
 * Validación para tipos de proyecto
 */
export const projectTypeSchema = z.enum([
  'production',
  'service',
  'internal',
]);

/**
 * Esquema de validación para crear un proyecto
 */
export const createProjectSchema = z.object({
  // Información básica
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  projectType: projectTypeSchema,
  
  status: projectStatusSchema.default('planning'),
  
  priority: projectPrioritySchema.default('medium'),
  
  // Relaciones
  clientId: z
    .string()
    .min(1, 'El cliente es obligatorio'),
  
  clientName: z
    .string()
    .min(1, 'El nombre del cliente es obligatorio'),
  
  opportunityId: z.string().optional(),
  
  quoteId: z.string().optional(),
  
  quoteNumber: z.string().optional(),
  
  // Financiero
  salesPrice: z
    .number()
    .min(0, 'El precio de venta debe ser mayor o igual a 0'),
  
  estimatedCost: z
    .number()
    .min(0, 'El costo estimado debe ser mayor o igual a 0')
    .default(0),
  
  currency: z
    .string()
    .length(3, 'La moneda debe ser un código de 3 letras (ej: USD)')
    .default('USD'),
  
  paymentTerms: z.string().optional(),
  
  // Fechas
  startDate: z.date().optional(),
  
  estimatedEndDate: z.date().optional(),
  
  // Equipo
  projectManager: z
    .string()
    .min(1, 'El Project Manager es obligatorio'),
  
  teamMembers: z
    .array(z.string())
    .default([]),
  
  // BOM
  bomId: z.string().optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  
  createdBy: z
    .string()
    .min(1, 'El creador es obligatorio'),
});

/**
 * Esquema de validación para actualizar un proyecto
 */
export const updateProjectSchema = createProjectSchema
  .partial()
  .omit({ createdBy: true });

/**
 * Esquema de validación para parámetros de búsqueda
 */
export const projectSearchParamsSchema = z.object({
  query: z.string().optional(),
  status: projectStatusSchema.optional(),
  priority: projectPrioritySchema.optional(),
  clientId: z.string().optional(),
  projectManager: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z
    .enum(['name', 'startDate', 'status', 'progressPercent', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  pageSize: z.number().min(1).max(100).default(20),
});

/**
 * Esquema para cambiar estado del proyecto
 */
export const changeProjectStatusSchema = z.object({
  projectId: z.string().min(1, 'El ID del proyecto es obligatorio'),
  newStatus: projectStatusSchema,
  reason: z.string().optional(),
  userId: z.string().min(1, 'El usuario es obligatorio'),
  userName: z.string().min(1, 'El nombre del usuario es obligatorio'),
});

/**
 * Esquema para actualizar progreso
 */
export const updateProgressSchema = z.object({
  projectId: z.string().min(1, 'El ID del proyecto es obligatorio'),
  progressPercent: z
    .number()
    .min(0, 'El progreso no puede ser negativo')
    .max(100, 'El progreso no puede ser mayor a 100'),
});

/**
 * Esquema para actualizar costos
 */
export const updateCostsSchema = z.object({
  projectId: z.string().min(1, 'El ID del proyecto es obligatorio'),
  materialsCost: z.number().min(0).optional(),
  laborCost: z.number().min(0).optional(),
  overheadCost: z.number().min(0).optional(),
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectSearchParams = z.infer<typeof projectSearchParamsSchema>;
export type ChangeProjectStatusInput = z.infer<typeof changeProjectStatusSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type UpdateCostsInput = z.infer<typeof updateCostsSchema>;
