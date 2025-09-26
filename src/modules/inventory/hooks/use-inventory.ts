import { useState, useEffect, useCallback, useRef } from 'react';
import { InventorySearchParams, InventoryDirectoryState } from '../types';
import { searchRawMaterials, searchFinishedProducts } from '../services/inventory.service';

export const useInventory = (initialParams: InventorySearchParams = {}) => {
  const [state, setState] = useState<InventoryDirectoryState>({
    rawMaterials: [],
    finishedProducts: [],
    loading: false,
    searchParams: { ...initialParams },
    totalCount: 0,
    activeTab: 'raw-materials',
  });

  const currentParamsRef = useRef(state.searchParams);
  currentParamsRef.current = state.searchParams;

  const fetchInventory = useCallback(async (params?: InventorySearchParams, tab?: 'raw-materials' | 'finished-products') => {
    const searchParams = params || currentParamsRef.current;
    const activeTab = tab || state.activeTab;
    
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      if (activeTab === 'raw-materials') {
        const result = await searchRawMaterials(searchParams);
        setState(prev => ({
          ...prev,
          rawMaterials: result.rawMaterials,
          totalCount: result.totalCount,
          loading: false,
          searchParams,
          activeTab,
        }));
      } else {
        const result = await searchFinishedProducts(searchParams);
        setState(prev => ({
          ...prev,
          finishedProducts: result.finishedProducts,
          totalCount: result.totalCount,
          loading: false,
          searchParams,
          activeTab,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar inventario',
      }));
    }
  }, [state.activeTab]);

  const updateSearchParams = useCallback((newParams: Partial<InventorySearchParams>) => {
    setState(prev => {
      const updatedParams = { ...prev.searchParams, ...newParams };
      fetchInventory(updatedParams, prev.activeTab);
      return { ...prev, searchParams: updatedParams };
    });
  }, [fetchInventory]);

  const switchTab = useCallback((tab: 'raw-materials' | 'finished-products') => {
    setState(prev => ({ ...prev, activeTab: tab }));
    fetchInventory(state.searchParams, tab);
  }, [fetchInventory, state.searchParams]);

  const refresh = useCallback(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Effect para cargar datos iniciales
  useEffect(() => {
    fetchInventory(initialParams, state.activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  return {
    ...state,
    fetchInventory,
    updateSearchParams,
    switchTab,
    refresh,
  };
};