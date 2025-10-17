import { useState, useEffect, useCallback, useRef } from 'react';
import { InventorySearchParams, InventoryDirectoryState } from '../types';
import { RawMaterialsService, FinishedProductsService } from '../services/inventory.service';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export const useInventory = (initialParams: InventorySearchParams = {}) => {
  const { firebaseUser, loading: authLoading } = useAuth();
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
    // 🔥 CRITICAL: Don't fetch if user is not authenticated
    if (!firebaseUser || authLoading) {
      return;
    }

    // 🔥 CRITICAL: Ensure Firebase Auth token is ready
    try {
      await auth.currentUser?.getIdToken(true); // Force token refresh
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for token propagation
    } catch {
      // Auth token refresh failed, return early
      return;
    }

    const searchParams = params || currentParamsRef.current;
    const activeTab = tab || activeTabRef.current;
    
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      if (activeTab === 'raw-materials') {
        const result = await RawMaterialsService.searchRawMaterials(searchParams);
        setState(prev => ({
          ...prev,
          rawMaterials: result.rawMaterials,
          totalCount: result.totalCount,
          loading: false,
          searchParams,
          activeTab,
        }));
      } else {
        const result = await FinishedProductsService.searchFinishedProducts(searchParams);
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
  }, [firebaseUser, authLoading]);

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