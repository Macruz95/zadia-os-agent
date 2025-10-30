/**
 * ZADIA OS - Dynamic Colors Utility
 * 
 * Calculate KPI status colors based on thresholds
 * Rule #2: ShadCN UI + Lucide icons only (Tailwind classes)
 * Rule #4: Modular architecture - Pure utility functions
 */

import type { KPIThreshold, KPIColorStatus } from '../types/kpi-thresholds.types';

/**
 * Get color status based on value and threshold
 * 
 * @param value - Current KPI value
 * @param threshold - Threshold configuration
 * @returns Color status (excellent/good/warning/critical)
 */
export function getKPIColorStatus(
  value: number,
  threshold: KPIThreshold
): KPIColorStatus {
  const { excellent, good, warning, isInverted } = threshold;

  // For inverted metrics (lower is better, e.g., expenses)
  if (isInverted) {
    if (value <= excellent) return 'excellent';
    if (value <= good) return 'good';
    if (value <= warning) return 'warning';
    return 'critical';
  }

  // For normal metrics (higher is better, e.g., revenue)
  if (value >= excellent) return 'excellent';
  if (value >= good) return 'good';
  if (value >= warning) return 'warning';
  return 'critical';
}

/**
 * Get Tailwind text color class
 */
export function getTextColorClass(status: KPIColorStatus): string {
  const colorMap: Record<KPIColorStatus, string> = {
    excellent: 'text-green-600 dark:text-green-400',
    good: 'text-yellow-600 dark:text-yellow-400',
    warning: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };

  return colorMap[status];
}

/**
 * Get Tailwind background color class
 */
export function getBgColorClass(status: KPIColorStatus): string {
  const colorMap: Record<KPIColorStatus, string> = {
    excellent: 'bg-green-50 dark:bg-green-950',
    good: 'bg-yellow-50 dark:bg-yellow-950',
    warning: 'bg-orange-50 dark:bg-orange-950',
    critical: 'bg-red-50 dark:bg-red-950',
  };

  return colorMap[status];
}

/**
 * Get Tailwind border color class
 */
export function getBorderColorClass(status: KPIColorStatus): string {
  const colorMap: Record<KPIColorStatus, string> = {
    excellent: 'border-green-200 dark:border-green-800',
    good: 'border-yellow-200 dark:border-yellow-800',
    warning: 'border-orange-200 dark:border-orange-800',
    critical: 'border-red-200 dark:border-red-800',
  };

  return colorMap[status];
}

/**
 * Get hex color for charts (recharts compatibility)
 */
export function getHexColor(status: KPIColorStatus): string {
  const colorMap: Record<KPIColorStatus, string> = {
    excellent: '#10b981', // green-500
    good: '#eab308',      // yellow-500
    warning: '#f97316',   // orange-500
    critical: '#ef4444',  // red-500
  };

  return colorMap[status];
}

/**
 * Get human-readable label
 */
export function getStatusLabel(status: KPIColorStatus): string {
  const labelMap: Record<KPIColorStatus, string> = {
    excellent: 'Excelente',
    good: 'Bueno',
    warning: 'Atención',
    critical: 'Crítico',
  };

  return labelMap[status];
}

/**
 * Get all color classes for a KPI status
 */
export function getColorClasses(status: KPIColorStatus) {
  return {
    text: getTextColorClass(status),
    bg: getBgColorClass(status),
    border: getBorderColorClass(status),
    hex: getHexColor(status),
    label: getStatusLabel(status),
  };
}

/**
 * Calculate complete KPI metadata with colors
 */
export function calculateKPIMetadata(
  value: number,
  threshold: KPIThreshold
) {
  const status = getKPIColorStatus(value, threshold);
  const colors = getColorClasses(status);

  return {
    value,
    status,
    ...colors,
  };
}
