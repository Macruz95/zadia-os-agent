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

  const activeTabRef = useRef(state.activeTab);
  activeTabRef.current = state.activeTab;

  // Ref para evitar múltiples cargas iniciales
  const initialLoadDone = useRef(false);

  const fetchInventory = useCallback(async (params?: InventorySearchParams, tab?: 'raw-materials' | 'finished-products') => {
    const searchParams = params || currentParamsRef.current;
    const activeTab = tab || activeTabRef.current;
    
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
  }, []);

  const updateSearchParams = useCallback((newParams: Partial<InventorySearchParams>) => {
    setState(prev => {
      const updatedParams = { ...prev.searchParams, ...newParams };
      fetchInventory(updatedParams, prev.activeTab);
      return { ...prev, searchParams: updatedParams };
    });
  }, [fetchInventory]);

  const switchTab = useCallback((tab: 'raw-materials' | 'finished-products') => {
    setState(prev => ({ ...prev, activeTab: tab }));
    fetchInventory(currentParamsRef.current, tab);
  }, [fetchInventory]);

  const refresh = useCallback(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Effect para cargar datos iniciales solo una vez
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchInventory(initialParams, 'raw-materials');
      initialLoadDone.current = true;
    }
  }, [fetchInventory, initialParams]);

  return {
    ...state,
    fetchInventory,
    updateSearchParams,
    switchTab,
    refresh,
  };
};