/**
 * ZADIA OS - Use BOM State Hook
 * Gestión del estado del BOM
 * Rule #5: Max 200 lines per file
 */

import { useState } from 'react';
import type {
  UseBOMState,
  BOMValidationResult,
  ProductionFeasibility,
} from './types';

/**
 * Hook para manejar el estado del BOM
 * @returns Estado y setters
 */
export function useBOMState() {
  const [bom, setBom] = useState<UseBOMState['bom']>(undefined);
  const [boms, setBoms] = useState<UseBOMState['boms']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [validationResult, setValidationResult] = useState<
    BOMValidationResult | undefined
  >(undefined);
  const [productionFeasibility, setProductionFeasibility] = useState<
    ProductionFeasibility | undefined
  >(undefined);

  return {
    // State
    bom,
    boms,
    loading,
    error,
    validationResult,
    productionFeasibility,
    // Setters
    setBom,
    setBoms,
    setLoading,
    setError,
    setValidationResult,
    setProductionFeasibility,
  };
}
