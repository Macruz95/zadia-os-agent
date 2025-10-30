/**
 * ZADIA OS - KPI Threshold Types
 * 
 * Types and Zod validation for KPI thresholds configuration
 * Rule #3: Validation with Zod
 * Rule #4: Modular architecture
 */

import { z } from 'zod';

/**
 * Threshold configuration for a single KPI
 */
export const KPIThresholdSchema = z.object({
  kpiName: z.string().min(1),
  excellent: z.number(), // Green threshold
  good: z.number(),      // Yellow threshold  
  warning: z.number(),   // Orange threshold
  // Below warning = Red
  isPercentage: z.boolean().default(false),
  isInverted: z.boolean().default(false) // For metrics where lower is better
});

export type KPIThreshold = z.infer<typeof KPIThresholdSchema>;

/**
 * User's KPI thresholds configuration
 */
export const KPIThresholdsConfigSchema = z.object({
  userId: z.string().min(1),
  thresholds: z.record(z.string(), KPIThresholdSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type KPIThresholdsConfig = z.infer<typeof KPIThresholdsConfigSchema>;

/**
 * KPI Color status
 */
export type KPIColorStatus = 'excellent' | 'good' | 'warning' | 'critical';

/**
 * KPI trend direction
 */
export type KPITrendDirection = 'up' | 'down' | 'stable';

/**
 * KPI with color and trend
 */
export interface KPIWithMetadata {
  value: number;
  colorStatus: KPIColorStatus;
  trend: KPITrendDirection;
  trendPercentage: number;
  sparklineData: number[];
}
