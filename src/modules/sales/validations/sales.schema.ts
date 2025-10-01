/**
 * ZADIA OS - Sales Validation Schemas
 * 
 * Zod schemas for all sales entities
 */

import { z } from 'zod';

// Base Enums
export const LeadSourceSchema = z.enum(['web', 'referral', 'event', 'cold-call', 'imported']);
export const LeadStatusSchema = z.enum(['new', 'contacted', 'qualifying', 'disqualified', 'converted']);
export const LeadPrioritySchema = z.enum(['hot', 'warm', 'cold']);
export const EntityTypeSchema = z.enum(['person', 'company', 'institution']);

export const OpportunityStageSchema = z.enum(['qualified', 'proposal-sent', 'negotiation', 'closed-won', 'closed-lost']);
export const OpportunityStatusSchema = z.enum(['open', 'won', 'lost']);
export const OpportunityPrioritySchema = z.enum(['high', 'medium', 'low']);

export const QuoteStatusSchema = z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']);

// Create Lead Input Validation Schema
export const createLeadSchema = z.object({
  entityType: z.enum(['person', 'company', 'institution']),
  fullName: z.string().min(1, 'Nombre requerido').optional(),
  entityName: z.string().min(1, 'Nombre de entidad requerido').optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Teléfono requerido'),
  phoneCountryId: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  source: LeadSourceSchema,
  priority: LeadPrioritySchema,
  notes: z.string().optional(),
  interests: z.string().optional(),
}).refine(
  (data) => {
    if (data.entityType === 'person' && !data.fullName) {
      return false;
    }
    if ((data.entityType === 'company' || data.entityType === 'institution') && !data.entityName) {
      return false;
    }
    return true;
  },
  {
    message: 'Nombre es requerido según el tipo de entidad',
    path: ['fullName', 'entityName'],
  }
);

// Lead Validation Schema
export const leadSchema = z.object({
  entityType: EntityTypeSchema,
  fullName: z.string().min(1, 'Nombre completo requerido').max(100, 'Nombre muy largo').optional(),
  entityName: z.string().min(1, 'Nombre de entidad requerido').max(100, 'Nombre muy largo').optional(),
  position: z.string().max(50, 'Puesto muy largo').optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono muy corto').max(20, 'Teléfono muy largo'),
  company: z.string().max(100, 'Empresa muy larga').optional(),
  source: LeadSourceSchema,
  priority: LeadPrioritySchema,
  score: z.number().int().min(1).max(100),
  assignedTo: z.string().min(1, 'Vendedor asignado requerido'),
  notes: z.string().max(1000, 'Notas muy largas').optional(),
}).refine((data) => {
  // Validate based on entity type
  if (data.entityType === 'person') {
    return data.fullName && data.fullName.length > 0;
  }
  return data.entityName && data.entityName.length > 0;
}, {
  message: 'Nombre completo requerido para persona o nombre de entidad para empresa/institución',
  path: ['fullName'],
});

export const LeadFormSchema = leadSchema;

export const LeadInteractionSchema = z.object({
  leadId: z.string().min(1, 'Lead ID requerido'),
  type: z.enum(['note', 'call', 'meeting', 'email']),
  summary: z.string().min(1, 'Resumen requerido').max(200, 'Resumen muy largo'),
  details: z.string().max(1000, 'Detalles muy largos').optional(),
  result: z.string().max(500, 'Resultado muy largo').optional(),
  attachments: z.array(z.string()).optional(),
});

// Opportunity Schemas
export const OpportunitySchema = z.object({
  name: z.string().min(1, 'Nombre de oportunidad requerido').max(100, 'Nombre muy largo'),
  clientId: z.string().min(1, 'Cliente requerido'),
  contactId: z.string().min(1, 'Contacto requerido'),
  estimatedValue: z.number().positive('Valor estimado debe ser positivo'),
  currency: z.string().length(3, 'Moneda debe ser código de 3 letras').default('USD'),
  expectedCloseDate: z.date().optional(),
  stage: OpportunityStageSchema.default('qualified'),
  priority: OpportunityPrioritySchema.default('medium'),
  assignedTo: z.string().min(1, 'Vendedor asignado requerido'),
  source: z.string().optional(), // Lead ID if converted
  notes: z.string().max(1000, 'Notas muy largas').optional(),
  lossReason: z.string().max(200, 'Motivo de pérdida muy largo').optional(),
});

export const OpportunityFormSchema = OpportunitySchema;

export const OpportunityInteractionSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID requerido'),
  type: z.enum(['note', 'call', 'meeting', 'email', 'stage-change']),
  summary: z.string().min(1, 'Resumen requerido').max(200, 'Resumen muy largo'),
  details: z.string().max(1000, 'Detalles muy largos').optional(),
  previousStage: OpportunityStageSchema.optional(),
  newStage: OpportunityStageSchema.optional(),
});

// Quote Schemas
export const QuoteItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida').max(200, 'Descripción muy larga'),
  quantity: z.number().positive('Cantidad debe ser positiva'),
  unitOfMeasure: z.string().min(1, 'Unidad de medida requerida'),
  unitPrice: z.number().positive('Precio unitario debe ser positivo'),
  discount: z.number().min(0, 'Descuento no puede ser negativo').max(100, 'Descuento no puede ser mayor a 100%'),
  subtotal: z.number().min(0, 'Subtotal no puede ser negativo'),
});

export const QuoteSchema = z.object({
  opportunityId: z.string().min(1, 'Oportunidad requerida'),
  clientId: z.string().min(1, 'Cliente requerido'),
  contactId: z.string().min(1, 'Contacto requerido'),
  items: z.array(QuoteItemSchema).min(1, 'Al menos un ítem requerido'),
  subtotal: z.number().min(0, 'Subtotal no puede ser negativo'),
  taxes: z.record(z.string(), z.number()).default({}),
  totalTaxes: z.number().min(0, 'Impuestos no pueden ser negativos'),
  discounts: z.number().min(0, 'Descuentos no pueden ser negativos'),
  total: z.number().positive('Total debe ser positivo'),
  currency: z.string().length(3, 'Moneda debe ser código de 3 letras').default('USD'),
  validUntil: z.date().refine((date) => date > new Date(), {
    message: 'Fecha de validez debe ser futura',
  }),
  paymentTerms: z.string().min(1, 'Términos de pago requeridos').max(200, 'Términos muy largos'),
  notes: z.string().max(1000, 'Notas muy largas').optional(),
  internalNotes: z.string().max(1000, 'Notas internas muy largas').optional(),
  assignedTo: z.string().min(1, 'Vendedor asignado requerido'),
  attachments: z.array(z.string()).optional(),
});

export const QuoteFormSchema = QuoteSchema;

// Search and Filter Schemas
export const LeadFiltersSchema = z.object({
  status: z.array(LeadStatusSchema).optional(),
  source: z.array(LeadSourceSchema).optional(),
  priority: z.array(LeadPrioritySchema).optional(),
  assignedTo: z.string().optional(),
  entityType: z.array(EntityTypeSchema).optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
});

export const OpportunityFiltersSchema = z.object({
  stage: z.array(OpportunityStageSchema).optional(),
  status: z.array(OpportunityStatusSchema).optional(),
  priority: z.array(OpportunityPrioritySchema).optional(),
  assignedTo: z.string().optional(),
  clientId: z.string().optional(),
  expectedCloseFrom: z.date().optional(),
  expectedCloseTo: z.date().optional(),
  valueFrom: z.number().positive().optional(),
  valueTo: z.number().positive().optional(),
});

export const QuoteFiltersSchema = z.object({
  status: z.array(QuoteStatusSchema).optional(),
  clientId: z.string().optional(),
  opportunityId: z.string().optional(),
  assignedTo: z.string().optional(),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  valueFrom: z.number().positive().optional(),
  valueTo: z.number().positive().optional(),
});

// Conversion Schemas
export const LeadConversionSchema = z.object({
  clientData: z.object({
    entityType: EntityTypeSchema,
    name: z.string().min(1, 'Nombre requerido'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(8, 'Teléfono muy corto'),
    company: z.string().optional(),
    position: z.string().optional(),
  }),
  opportunityData: z.object({
    name: z.string().min(1, 'Nombre de oportunidad requerido'),
    estimatedValue: z.number().positive('Valor estimado debe ser positivo'),
    expectedCloseDate: z.date().optional(),
    notes: z.string().optional(),
  }),
});

// Type exports
export type LeadFormData = z.infer<typeof LeadFormSchema>;
export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type LeadInteractionData = z.infer<typeof LeadInteractionSchema>;
export type OpportunityFormData = z.infer<typeof OpportunityFormSchema>;
export type OpportunityInteractionData = z.infer<typeof OpportunityInteractionSchema>;
export type QuoteFormData = z.infer<typeof QuoteFormSchema>;
export type QuoteItemData = z.infer<typeof QuoteItemSchema>;
export type LeadFiltersData = z.infer<typeof LeadFiltersSchema>;
export type OpportunityFiltersData = z.infer<typeof OpportunityFiltersSchema>;
export type QuoteFiltersData = z.infer<typeof QuoteFiltersSchema>;
export type LeadConversionData = z.infer<typeof LeadConversionSchema>;