/**
 * ZADIA OS - Quote to Project Conversion Validation Schemas
 * 
 * Schemas for Quote → Project conversion flow
 * Following ZADIA Rule 3: Strict Zod validation
 */

import { z } from 'zod';

/**
 * Schema for quote acceptance decision
 */
export const quoteAcceptanceSchema = z.object({
  quoteId: z.string().min(1, 'ID de cotización requerido'),
  acceptanceNotes: z.string().optional(),
  customerPO: z.string().optional(), // Purchase Order number from customer
  acceptedBy: z.string().min(1, 'Usuario requerido'),
});

export type QuoteAcceptanceInput = z.infer<typeof quoteAcceptanceSchema>;

/**
 * Schema for project configuration
 */
export const projectConfigSchema = z.object({
  name: z.string().min(3, 'Nombre de proyecto requerido'),
  description: z.string().optional(),
  startDate: z.date(),
  estimatedEndDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  projectManager: z.string().optional(),
  team: z.array(z.string()).optional().default([]),
  budget: z.number().min(0, 'Presupuesto debe ser positivo').optional(),
  notes: z.string().optional(),
});

export type ProjectConfigInput = z.infer<typeof projectConfigSchema>;

/**
 * Schema for inventory item reservation
 */
export const inventoryReservationSchema = z.object({
  productId: z.string().min(1, 'ID de producto requerido'),
  productName: z.string(),
  quantity: z.number().positive('Cantidad debe ser positiva'),
  unitOfMeasure: z.string(),
  reservedFrom: z.enum(['warehouse', 'supplier', 'production']).default('warehouse'),
  expectedDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
});

export type InventoryReservationInput = z.infer<typeof inventoryReservationSchema>;

/**
 * Schema for work order creation
 */
export const workOrderSchema = z.object({
  title: z.string().min(3, 'Título de orden requerido'),
  description: z.string().optional(),
  type: z.enum(['installation', 'delivery', 'service', 'maintenance', 'other']).default('installation'),
  assignedTo: z.string().optional(),
  scheduledDate: z.date().optional(),
  estimatedDuration: z.number().positive('Duración debe ser positiva').optional(), // in hours
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  materials: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
  })).optional().default([]),
  notes: z.string().optional(),
});

export type WorkOrderInput = z.infer<typeof workOrderSchema>;

/**
 * Complete conversion data schema
 */
export const quoteProjectConversionSchema = z.object({
  quoteId: z.string().min(1, 'ID de cotización requerido'),
  acceptance: quoteAcceptanceSchema,
  projectConfig: projectConfigSchema,
  inventoryReservations: z.array(inventoryReservationSchema).optional().default([]),
  workOrders: z.array(workOrderSchema).optional().default([]),
  notifyTeam: z.boolean().default(true),
  notifyClient: z.boolean().default(true),
});

export type QuoteProjectConversionInput = z.infer<typeof quoteProjectConversionSchema>;

/**
 * Conversion result schema
 */
export const conversionResultSchema = z.object({
  success: z.boolean(),
  quoteId: z.string(),
  projectId: z.string(),
  reservationsCreated: z.number().default(0),
  workOrdersCreated: z.number().default(0),
  message: z.string(),
  timestamp: z.date(),
});

export type ConversionResult = z.infer<typeof conversionResultSchema>;
