import { z } from 'zod';

/**
 * ZADIA OS - Tenant Validation Schemas
 * Zod schemas for tenant-related data validation
 */

// ============================================
// Subscription Plan Schema
// ============================================
export const subscriptionPlanSchema = z.enum(['free', 'pro', 'enterprise']);

// ============================================
// Tenant Role Schema
// ============================================
export const tenantRoleSchema = z.enum(['owner', 'admin', 'manager', 'member', 'viewer']);

// ============================================
// Tenant Settings Schema
// ============================================
export const tenantSettingsSchema = z.object({
  currency: z.string().min(3).max(3).default('USD'),
  timezone: z.string().default('America/Mexico_City'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  language: z.enum(['es', 'en']).default('es'),
  branding: z.object({
    logo: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    companyName: z.string().max(100).optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
});

// ============================================
// Create Tenant Schema
// ============================================
export const createTenantSchema = z.object({
  name: z
    .string()
    .min(2, 'tenant.validation.nameMinLength')
    .max(100, 'tenant.validation.nameMaxLength')
    .transform(val => val.trim()),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'tenant.validation.slugFormat')
    .optional(),
  plan: subscriptionPlanSchema.optional().default('free'),
  settings: tenantSettingsSchema.partial().optional(),
});

// ============================================
// Update Tenant Schema
// ============================================
export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(2, 'tenant.validation.nameMinLength')
    .max(100, 'tenant.validation.nameMaxLength')
    .transform(val => val.trim())
    .optional(),
  settings: tenantSettingsSchema.partial().optional(),
});

// ============================================
// Invite Member Schema
// ============================================
export const inviteMemberSchema = z.object({
  email: z
    .string()
    .email('tenant.validation.invalidEmail')
    .transform(val => val.toLowerCase().trim()),
  role: tenantRoleSchema,
  permissions: z.array(z.string()).optional(),
});

// ============================================
// Tenant Member Schema
// ============================================
export const tenantMemberSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: tenantRoleSchema,
  permissions: z.array(z.string()),
  joinedAt: z.date(),
  invitedBy: z.string(),
  isActive: z.boolean(),
  lastAccess: z.date().optional(),
});

// ============================================
// Type Exports
// ============================================
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
