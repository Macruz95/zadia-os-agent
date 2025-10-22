/**
 * ZADIA OS - Quote Calculator Service
 * 
 * Business logic for quote financial calculations
 * Rule #1: Real calculations with proper formulas
 * Rule #4: Error handling with logger
 * Rule #5: Max 200 lines per file
 * 
 * @module QuoteCalculatorService
 */

import { logger } from '@/lib/logger';
import type {
  CalculatorMaterial,
  AdditionalCostsConfig,
  LaborCostConfig,
  TaxConfig,
  FinancialBreakdown,
} from '../types/calculator.types';

/**
 * Calculate labor cost
 */
export function calculateLaborCost(
  hours: number,
  hourlyRate: number
): number {
  return hours * hourlyRate;
}

/**
 * Calculate materials total cost
 */
export function calculateMaterialsCost(
  materials: CalculatorMaterial[]
): number {
  return materials.reduce((total, material) => {
    return total + (material.unitPrice * material.quantity);
  }, 0);
}

/**
 * Calculate additional costs based on configuration
 */
export function calculateAdditionalCosts(
  baseCost: number,
  config: AdditionalCostsConfig
): number {
  let total = 0;

  // Tool wear and tear
  if (config.toolWear) {
    total += baseCost * (config.toolWearRate / 100);
  }

  // Workshop maintenance
  if (config.maintenance) {
    total += baseCost * (config.maintenanceRate / 100);
  }

  // Logistics and transport
  if (config.logistics) {
    total += baseCost * (config.logisticsRate / 100);
  }

  // Fixed increment
  total += config.fixedIncrement;

  return total;
}

/**
 * Calculate gross profit based on commercial margin
 */
export function calculateGrossProfit(
  totalProductionCost: number,
  commercialMarginPercent: number
): number {
  return totalProductionCost * (commercialMarginPercent / 100);
}

/**
 * Calculate taxes
 */
export function calculateTaxes(
  salePrice: number,
  taxRate: number
): TaxConfig {
  return {
    name: 'IVA',
    rate: taxRate,
    amount: salePrice * (taxRate / 100),
  };
}

/**
 * Calculate complete financial breakdown
 * Main calculator function that orchestrates all calculations
 */
export function calculateFinancialBreakdown(
  labor: LaborCostConfig,
  materials: CalculatorMaterial[],
  additionalCostsConfig: AdditionalCostsConfig,
  commercialMargin: number,
  taxRate: number = 13
): FinancialBreakdown {
  try {
    // Step 1: Calculate labor cost
    const laborCost = calculateLaborCost(labor.hours, labor.hourlyRate);

    // Step 2: Calculate materials cost
    const materialsCost = calculateMaterialsCost(materials);

    // Step 3: Calculate base production cost
    const baseProductionCost = laborCost + materialsCost;

    // Step 4: Calculate additional costs
    const additionalCosts = calculateAdditionalCosts(
      baseProductionCost,
      additionalCostsConfig
    );

    // Step 5: Calculate total production cost
    const totalProductionCost = baseProductionCost + additionalCosts;

    // Step 6: Calculate gross profit
    const grossProfit = calculateGrossProfit(
      totalProductionCost,
      commercialMargin
    );

    // Step 7: Calculate sale price (without taxes)
    const salePrice = totalProductionCost + grossProfit;

    // Step 8: Calculate taxes
    const taxConfig = calculateTaxes(salePrice, taxRate);
    const totalTaxes = taxConfig.amount;

    // Step 9: Calculate final price
    const finalPrice = salePrice + totalTaxes;

    const breakdown: FinancialBreakdown = {
      laborCost,
      materialsCost,
      additionalCosts,
      baseProductionCost,
      totalProductionCost,
      commercialMarginPercent: commercialMargin,
      grossProfit,
      salePrice,
      taxes: [taxConfig],
      totalTaxes,
      finalPrice,
    };

    logger.info('Financial breakdown calculated');

    return breakdown;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error calculating financial breakdown', err);
    
    // Return zero breakdown on error
    return {
      laborCost: 0,
      materialsCost: 0,
      additionalCosts: 0,
      baseProductionCost: 0,
      totalProductionCost: 0,
      commercialMarginPercent: commercialMargin,
      grossProfit: 0,
      salePrice: 0,
      taxes: [],
      totalTaxes: 0,
      finalPrice: 0,
    };
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMarginPercent(
  grossProfit: number,
  finalPrice: number
): number {
  if (finalPrice === 0) return 0;
  return (grossProfit / finalPrice) * 100;
}
