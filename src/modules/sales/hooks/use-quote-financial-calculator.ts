/**
 * ZADIA OS - Quote Financial Calculator Hook
 * 
 * Advanced financial calculator for quotes with labor, materials, and costs
 * Rule #1: TypeScript strict mode
 * Rule #3: Real-time reactive calculations
 * Rule #5: Keep focused on single responsibility
 * 
 * @module useQuoteFinancialCalculator
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  CalculatorMaterial,
  AdditionalCostsConfig,
  LaborCostConfig,
  FinancialBreakdown,
  QuoteCalculatorState,
} from '../types/calculator.types';
import { calculateFinancialBreakdown } from '../services/quote-calculator.service';

interface UseQuoteFinancialCalculatorOptions {
  /** Initial labor hours */
  initialHours?: number;
  
  /** Initial hourly rate */
  initialHourlyRate?: number;
  
  /** Initial commercial margin percentage */
  initialCommercialMargin?: number;
  
  /** Initial tax rate percentage */
  initialTaxRate?: number;
}

interface UseQuoteFinancialCalculatorReturn {
  /** Current calculator state */
  state: QuoteCalculatorState;
  
  /** Update labor configuration */
  updateLabor: (labor: Partial<LaborCostConfig>) => void;
  
  /** Add material to calculation */
  addMaterial: (material: Omit<CalculatorMaterial, 'subtotal'>) => void;
  
  /** Remove material from calculation */
  removeMaterial: (materialId: string) => void;
  
  /** Update material quantity */
  updateMaterialQuantity: (materialId: string, quantity: number) => void;
  
  /** Update additional costs configuration */
  updateAdditionalCosts: (config: Partial<AdditionalCostsConfig>) => void;
  
  /** Update commercial margin */
  setCommercialMargin: (margin: number) => void;
  
  /** Update tax rate */
  setTaxRate: (rate: number) => void;
  
  /** Reset calculator to initial state */
  reset: () => void;
  
  /** Get current breakdown */
  breakdown: FinancialBreakdown;
}

/**
 * Hook for managing advanced quote financial calculator
 */
export function useQuoteFinancialCalculator(
  options: UseQuoteFinancialCalculatorOptions = {}
): UseQuoteFinancialCalculatorReturn {
  const {
    initialHours = 0,
    initialHourlyRate = 3.75,
    initialCommercialMargin = 30,
    initialTaxRate = 13,
  } = options;

  // Initialize state
  const [labor, setLabor] = useState<LaborCostConfig>({
    hours: initialHours,
    hourlyRate: initialHourlyRate,
    total: initialHours * initialHourlyRate,
  });

  const [materials, setMaterials] = useState<CalculatorMaterial[]>([]);

  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCostsConfig>({
    toolWear: true,
    toolWearRate: 10,
    maintenance: true,
    maintenanceRate: 15,
    logistics: true,
    logisticsRate: 10,
    fixedIncrement: 0,
  });

  const [commercialMargin, setCommercialMargin] = useState(initialCommercialMargin);
  const [taxRate, setTaxRate] = useState(initialTaxRate);
  const [breakdown, setBreakdown] = useState<FinancialBreakdown>({
    laborCost: 0,
    materialsCost: 0,
    additionalCosts: 0,
    baseProductionCost: 0,
    totalProductionCost: 0,
    commercialMarginPercent: initialCommercialMargin,
    grossProfit: 0,
    salePrice: 0,
    taxes: [],
    totalTaxes: 0,
    finalPrice: 0,
  });

  // Recalculate breakdown whenever dependencies change
  useEffect(() => {
    const newBreakdown = calculateFinancialBreakdown(
      labor,
      materials,
      additionalCosts,
      commercialMargin,
      taxRate
    );
    setBreakdown(newBreakdown);
  }, [labor, materials, additionalCosts, commercialMargin, taxRate]);

  // Update labor configuration
  const updateLabor = useCallback((updates: Partial<LaborCostConfig>) => {
    setLabor((prev) => {
      const newLabor = { ...prev, ...updates };
      newLabor.total = newLabor.hours * newLabor.hourlyRate;
      return newLabor;
    });
  }, []);

  // Add material
  const addMaterial = useCallback((material: Omit<CalculatorMaterial, 'subtotal'>) => {
    setMaterials((prev) => {
      // Check if material already exists
      if (prev.some((m) => m.id === material.id)) {
        return prev;
      }

      const subtotal = material.unitPrice * material.quantity;
      return [...prev, { ...material, subtotal }];
    });
  }, []);

  // Remove material
  const removeMaterial = useCallback((materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  }, []);

  // Update material quantity
  const updateMaterialQuantity = useCallback((materialId: string, quantity: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? { ...m, quantity, subtotal: m.unitPrice * quantity }
          : m
      )
    );
  }, []);

  // Update additional costs
  const updateAdditionalCosts = useCallback((config: Partial<AdditionalCostsConfig>) => {
    setAdditionalCosts((prev) => ({ ...prev, ...config }));
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setLabor({
      hours: initialHours,
      hourlyRate: initialHourlyRate,
      total: initialHours * initialHourlyRate,
    });
    setMaterials([]);
    setAdditionalCosts({
      toolWear: true,
      toolWearRate: 10,
      maintenance: true,
      maintenanceRate: 15,
      logistics: true,
      logisticsRate: 10,
      fixedIncrement: 0,
    });
    setCommercialMargin(initialCommercialMargin);
    setTaxRate(initialTaxRate);
  }, [initialHours, initialHourlyRate, initialCommercialMargin, initialTaxRate]);

  return {
    state: {
      labor,
      materials,
      additionalCosts,
      commercialMargin,
      taxRate,
      breakdown,
    },
    updateLabor,
    addMaterial,
    removeMaterial,
    updateMaterialQuantity,
    updateAdditionalCosts,
    setCommercialMargin,
    setTaxRate,
    reset,
    breakdown,
  };
}
