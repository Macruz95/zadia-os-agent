/**
 * ZADIA OS - Use BOM Hook (Facade)
 * Manages Bill of Materials state and operations
 * Rule #5: Modular architecture - Main facade
 */

'use client';

import { useBOMState } from './use-bom/use-bom-state';
import { useBOMActions } from './use-bom/use-bom-actions';
import type { UseBOMReturn } from './use-bom/types';

/**
 * Main BOM hook combining state and actions
 */
export function useBOM(): UseBOMReturn {
  const state = useBOMState();
  
  const actions = useBOMActions({
    setBom: state.setBom,
    setBoms: state.setBoms,
    setLoading: state.setLoading,
    setError: state.setError,
    setValidationResult: state.setValidationResult,
    setProductionFeasibility: state.setProductionFeasibility,
    bom: state.bom,
  });

  return {
    // State
    bom: state.bom,
    boms: state.boms,
    loading: state.loading,
    error: state.error,
    validationResult: state.validationResult,
    productionFeasibility: state.productionFeasibility,
    // Actions
    ...actions,
  };
}

// Re-export types
export type {
  UseBOMReturn,
  BOMValidationResult,
  ProductionFeasibility,
} from './use-bom/types';
