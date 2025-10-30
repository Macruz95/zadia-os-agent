/**
 * ZADIA OS - KPI Color Utils
 * 
 * Dynamic color calculation for KPIs based on thresholds
 * Rule #1: Real data from Firebase
 * Rule #4: Modular utilities
 * Rule #5: Max 200 lines
 */

import type { KPIThreshold, KPIColorStatus, KPITrendDirection } from '../types/kpi-thresholds.types';

/**
 * Default thresholds for common KPIs (if user hasn't configured custom ones)
 */
export const DEFAULT_THRESHOLDS: Record<string, KPIThreshold> = {
  revenue: {
    kpiName: 'revenue',
    excellent: 100000,
    good: 75000,
    warning: 50000,
    isPercentage: false,
    isInverted: false
  },
  profit: {
    kpiName: 'profit',
    excellent: 30000,
    good: 20000,
    warning: 10000,
    isPercentage: false,
    isInverted: false
  },
  profitMargin: {
    kpiName: 'profitMargin',
    excellent: 30,
    good: 20,
    warning: 10,
    isPercentage: true,
    isInverted: false
  },
  conversionRate: {
    kpiName: 'conversionRate',
    excellent: 30,
    good: 20,
    warning: 10,
    isPercentage: true,
    isInverted: false
  },
  pendingInvoices: {
    kpiName: 'pendingInvoices',
    excellent: 5,
    good: 10,
    warning: 20,
    isPercentage: false,
    isInverted: true // Lower is better
  }
};

/**
 * Calculate color status based on value and threshold
 */
export function calculateKPIColorStatus(
  value: number,
  threshold?: KPIThreshold
): KPIColorStatus {
  if (!threshold) {
    return 'good'; // Default if no threshold configured
  }

  const { excellent, good, warning, isInverted } = threshold;

  if (isInverted) {
    // For metrics where lower is better (e.g., pending invoices, costs)
    if (value <= excellent) return 'excellent';
    if (value <= good) return 'good';
    if (value <= warning) return 'warning';
    return 'critical';
  } else {
    // For metrics where higher is better (e.g., revenue, profit)
    if (value >= excellent) return 'excellent';
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    return 'critical';
  }
}

/**
 * Get Tailwind CSS classes for KPI color status
 */
export function getKPIColorClasses(status: KPIColorStatus): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (status) {
    case 'excellent':
      return {
        bg: 'bg-green-50 dark:bg-green-950/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-500'
      };
    case 'good':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-500'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-500'
      };
    case 'critical':
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-500'
      };
  }
}

/**
 * Calculate trend direction from sparkline data
 */
export function calculateTrendDirection(data: number[]): KPITrendDirection {
  if (data.length < 2) return 'stable';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (percentageChange > 5) return 'up';
  if (percentageChange < -5) return 'down';
  return 'stable';
}

/**
 * Calculate trend percentage
 */
export function calculateTrendPercentage(data: number[]): number {
  if (data.length < 2) return 0;

  const first = data[0] || 1;
  const last = data[data.length - 1] || 0;

  return ((last - first) / first) * 100;
}

/**
 * Get trend icon name (Lucide React)
 */
export function getTrendIcon(direction: KPITrendDirection): 'TrendingUp' | 'TrendingDown' | 'Minus' {
  switch (direction) {
    case 'up':
      return 'TrendingUp';
    case 'down':
      return 'TrendingDown';
    case 'stable':
      return 'Minus';
  }
}

/**
 * Get trend color classes
 */
export function getTrendColorClass(direction: KPITrendDirection): string {
  switch (direction) {
    case 'up':
      return 'text-green-600 dark:text-green-500';
    case 'down':
      return 'text-red-600 dark:text-red-500';
    case 'stable':
      return 'text-gray-600 dark:text-gray-500';
  }
}
