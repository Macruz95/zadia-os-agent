/**
 * ZADIA OS - Quote Calculator Types
 * 
 * Types for financial calculator in quote creation
 * Rule #1: TypeScript strict mode
 * Rule #5: Keep types organized and modular
 */

/**
 * Material item for calculator
 */
export interface CalculatorMaterial {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  subtotal: number;
  type?: 'raw' | 'finished';
}

/**
 * Additional costs configuration
 */
export interface AdditionalCostsConfig {
  /** Tool wear and tear (percentage of base cost) */
  toolWear: boolean;
  toolWearRate: number; // Default: 10%
  
  /** Workshop maintenance (percentage of base cost) */
  maintenance: boolean;
  maintenanceRate: number; // Default: 15%
  
  /** Logistics and transport (percentage of base cost) */
  logistics: boolean;
  logisticsRate: number; // Default: 10%
  
  /** Fixed additional increment */
  fixedIncrement: number;
}

/**
 * Labor cost configuration
 */
export interface LaborCostConfig {
  /** Estimated hours */
  hours: number;
  
  /** Cost per hour */
  hourlyRate: number;
  
  /** Total labor cost */
  total: number;
}

/**
 * Tax configuration
 */
export interface TaxConfig {
  /** Tax name (e.g., "IVA") */
  name: string;
  
  /** Tax rate (percentage) */
  rate: number;
  
  /** Tax amount */
  amount: number;
}

/**
 * Complete financial breakdown
 */
export interface FinancialBreakdown {
  /** Labor cost */
  laborCost: number;
  
  /** Materials cost */
  materialsCost: number;
  
  /** Additional costs total */
  additionalCosts: number;
  
  /** Base production cost (labor + materials) */
  baseProductionCost: number;
  
  /** Total production cost (base + additional) */
  totalProductionCost: number;
  
  /** Commercial margin percentage */
  commercialMarginPercent: number;
  
  /** Gross profit amount */
  grossProfit: number;
  
  /** Sale price (without taxes) */
  salePrice: number;
  
  /** Taxes breakdown */
  taxes: TaxConfig[];
  
  /** Total taxes */
  totalTaxes: number;
  
  /** Final sale price (with taxes) */
  finalPrice: number;
}

/**
 * Calculator state
 */
export interface QuoteCalculatorState {
  /** Labor configuration */
  labor: LaborCostConfig;
  
  /** Selected materials */
  materials: CalculatorMaterial[];
  
  /** Additional costs config */
  additionalCosts: AdditionalCostsConfig;
  
  /** Commercial margin (percentage) */
  commercialMargin: number;
  
  /** Tax rate (percentage) */
  taxRate: number;
  
  /** Calculated financial breakdown */
  breakdown: FinancialBreakdown;
}

/**
 * Default additional costs configuration
 */
export const DEFAULT_ADDITIONAL_COSTS: AdditionalCostsConfig = {
  toolWear: true,
  toolWearRate: 10,
  maintenance: true,
  maintenanceRate: 15,
  logistics: true,
  logisticsRate: 10,
  fixedIncrement: 0,
};

/**
 * Default labor cost configuration
 */
export const DEFAULT_LABOR_COST: LaborCostConfig = {
  hours: 0,
  hourlyRate: 3.75,
  total: 0,
};
