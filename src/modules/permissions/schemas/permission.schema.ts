import { z } from 'zod';
import { ALL_MODULES, ALL_ACTIONS } from '../types/permission.types';

/**
 * ZADIA OS - Permission Validation Schemas
 */

// ============================================
// Module Schema
// ============================================
export const moduleSchema = z.enum(ALL_MODULES as [string, ...string[]]);

// ============================================
// Action Schema
// ============================================
export const actionSchema = z.enum(ALL_ACTIONS as [string, ...string[]]);

// ============================================
// Permission Schema
// ============================================
export const permissionSchema = z.object({
  module: moduleSchema,
  actions: z.array(actionSchema).min(1, 'Al menos una acción requerida'),
});

// ============================================
// Custom Rule Schema
// ============================================
export const customRuleSchema = z.object({
  type: z.enum(['field', 'record', 'condition']),
  module: moduleSchema,
  rule: z.string().min(1),
  description: z.string().optional(),
});

// ============================================
// Role Definition Schema
// ============================================
export const roleDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(permissionSchema),
  customRules: z.array(customRuleSchema).optional(),
  isSystem: z.boolean().default(false),
});

// ============================================
// Create Custom Role Schema
// ============================================
export const createRoleSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(permissionSchema).min(1, 'Al menos un permiso requerido'),
  customRules: z.array(customRuleSchema).optional(),
});

// ============================================
// Update Role Schema
// ============================================
export const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: z.array(permissionSchema).optional(),
  customRules: z.array(customRuleSchema).optional(),
});

// ============================================
// Type Exports
// ============================================
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
