/**
 * ZADIA OS - Opportunity Profile Page Schemas
 * 
 * Zod validation schemas for opportunity profile interactions and updates
 * 
 * @module sales/validations/opportunity-profile.schema
 */

import { z } from 'zod';

/**
 * Schema for creating opportunity interactions
 */
export const createOpportunityInteractionSchema = z.object({
  opportunityId: z.string().min(1, 'ID de oportunidad requerido'),
  type: z.enum(['note', 'call', 'meeting', 'email'], {
    message: 'Tipo de interacción inválido',
  }),
  summary: z.string()
    .min(3, 'Resumen debe tener al menos 3 caracteres')
    .max(200, 'Resumen no puede exceder 200 caracteres'),
  details: z.string()
    .max(2000, 'Detalles no pueden exceder 2000 caracteres')
    .optional(),
  performedBy: z.string().min(1, 'Usuario requerido'),
});

export type CreateOpportunityInteractionInput = z.infer<typeof createOpportunityInteractionSchema>;

/**
 * Schema for stage change interactions
 */
export const stageChangeInteractionSchema = z.object({
  opportunityId: z.string().min(1, 'ID de oportunidad requerido'),
  type: z.literal('stage-change'),
  summary: z.string().min(1, 'Resumen requerido'),
  previousStage: z.enum([
    'qualified',
    'proposal-sent',
    'negotiation',
    'closed-won',
    'closed-lost',
  ]),
  newStage: z.enum([
    'qualified',
    'proposal-sent',
    'negotiation',
    'closed-won',
    'closed-lost',
  ]),
  performedBy: z.string().min(1, 'Usuario requerido'),
});

export type StageChangeInteractionInput = z.infer<typeof stageChangeInteractionSchema>;

/**
 * Schema for updating opportunity basic info
 */
export const updateOpportunityBasicInfoSchema = z.object({
  name: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .optional(),
  estimatedValue: z.number()
    .min(0, 'Valor debe ser positivo')
    .optional(),
  expectedCloseDate: z.date().optional(),
  probability: z.number()
    .min(0, 'Probabilidad mínima es 0')
    .max(100, 'Probabilidad máxima es 100')
    .optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  notes: z.string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
});

export type UpdateOpportunityBasicInfoInput = z.infer<typeof updateOpportunityBasicInfoSchema>;

/**
 * Schema for note interaction (simplified form)
 */
export const noteInteractionSchema = z.object({
  summary: z.string()
    .min(3, 'Título debe tener al menos 3 caracteres')
    .max(100, 'Título no puede exceder 100 caracteres'),
  details: z.string()
    .min(10, 'La nota debe tener al menos 10 caracteres')
    .max(2000, 'La nota no puede exceder 2000 caracteres')
    .optional(),
});

export type NoteInteractionInput = z.infer<typeof noteInteractionSchema>;

/**
 * Schema for call interaction
 */
export const callInteractionSchema = z.object({
  summary: z.string()
    .min(5, 'Título debe tener al menos 5 caracteres')
    .max(100, 'Título no puede exceder 100 caracteres'),
  details: z.string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
  duration: z.number()
    .min(1, 'Duración mínima es 1 minuto')
    .max(480, 'Duración máxima es 480 minutos (8 horas)')
    .optional(),
});

export type CallInteractionInput = z.infer<typeof callInteractionSchema>;

/**
 * Schema for meeting interaction
 */
export const meetingInteractionSchema = z.object({
  summary: z.string()
    .min(5, 'Título debe tener al menos 5 caracteres')
    .max(100, 'Título no puede exceder 100 caracteres'),
  details: z.string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
  location: z.string()
    .max(200, 'Ubicación no puede exceder 200 caracteres')
    .optional(),
  attendees: z.array(z.string()).optional(),
});

export type MeetingInteractionInput = z.infer<typeof meetingInteractionSchema>;

/**
 * Schema for email interaction
 */
export const emailInteractionSchema = z.object({
  summary: z.string()
    .min(5, 'Asunto debe tener al menos 5 caracteres')
    .max(200, 'Asunto no puede exceder 200 caracteres'),
  details: z.string()
    .min(10, 'El email debe tener al menos 10 caracteres')
    .max(5000, 'El email no puede exceder 5000 caracteres')
    .optional(),
  recipients: z.array(z.string().email('Email inválido')).optional(),
  attachments: z.array(z.string()).optional(),
});

export type EmailInteractionInput = z.infer<typeof emailInteractionSchema>;
