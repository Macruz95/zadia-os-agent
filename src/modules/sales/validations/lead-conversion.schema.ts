/**
 * ZADIA OS - Lead Conversion Validation Schemas
 * 
 * Schemas for Lead → Client → Opportunity conversion flow
 * Following ZADIA Rule 3: Strict Zod validation
 */

import { z } from 'zod';

/**
 * Schema for duplicate detection search
 */
export const duplicateSearchSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono debe tener al menos 8 dígitos'),
  entityName: z.string().optional(),
  fullName: z.string().optional(),
});

export type DuplicateSearchInput = z.infer<typeof duplicateSearchSchema>;

/**
 * Schema for detected duplicate clients
 */
export const duplicateClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  clientType: z.enum(['PersonaNatural', 'Organización', 'Empresa']),
  status: z.enum(['Prospecto', 'Activo', 'Inactivo']),
  createdAt: z.date(),
  matchScore: z.number().min(0).max(100), // Similarity score
  matchReason: z.string(), // Why it's a duplicate
});

export type DuplicateClient = z.infer<typeof duplicateClientSchema>;

/**
 * Schema for conversion decision
 */
export const conversionDecisionSchema = z.object({
  action: z.enum(['create-new', 'link-existing']),
  existingClientId: z.string().optional(),
});

export type ConversionDecision = z.infer<typeof conversionDecisionSchema>;

/**
 * Schema for client creation from lead
 */
export const clientFromLeadSchema = z.object({
  clientType: z.enum(['PersonaNatural', 'Organización', 'Empresa']),
  name: z.string().min(2, 'Nombre requerido'),
  documentId: z.string().min(5, 'Documento requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  phoneCountryId: z.string().optional(),
  status: z.enum(['Prospecto', 'Activo', 'Inactivo']).optional().default('Activo'),
  source: z.string().optional(),
  address: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    district: z.string().optional(),
    street: z.string(),
    postalCode: z.string().optional(),
  }),
  tags: z.array(z.string()).optional().default([]),
  communicationOptIn: z.boolean().optional().default(true),
  
  // Optional fields for PersonaNatural
  birthDate: z.date().optional(),
  gender: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
});

export type ClientFromLeadInput = z.infer<typeof clientFromLeadSchema>;

/**
 * Schema for opportunity creation from conversion
 */
export const opportunityFromConversionSchema = z.object({
  name: z.string().min(5, 'Nombre de oportunidad requerido'),
  clientId: z.string(),
  contactId: z.string().optional(),
  estimatedValue: z.number().min(0, 'Valor debe ser positivo').optional().default(0),
  currency: z.string().optional().default('USD'),
  expectedCloseDate: z.date().optional(),
  stage: z.enum(['qualified', 'proposal-sent', 'negotiation', 'closed-won', 'closed-lost']).optional().default('qualified'),
  status: z.enum(['open', 'won', 'lost']).optional().default('open'),
  probability: z.number().min(0).max(100).optional().default(20),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  notes: z.string().optional(),
  source: z.string(), // Lead ID
});

export type OpportunityFromConversionInput = z.infer<typeof opportunityFromConversionSchema>;

/**
 * Complete conversion data schema
 */
export const leadConversionSchema = z.object({
  leadId: z.string(),
  conversionDecision: conversionDecisionSchema,
  clientData: clientFromLeadSchema.optional(),
  opportunityData: opportunityFromConversionSchema,
  transferHistory: z.boolean().default(true),
  notifyTeam: z.boolean().default(true),
});

export type LeadConversionInput = z.infer<typeof leadConversionSchema>;

/**
 * Conversion result schema
 */
export const conversionResultSchema = z.object({
  success: z.boolean(),
  leadId: z.string(),
  clientId: z.string(),
  opportunityId: z.string(),
  isNewClient: z.boolean(),
  historyTransferred: z.boolean(),
  message: z.string(),
  timestamp: z.date(),
});

export type ConversionResult = z.infer<typeof conversionResultSchema>;
