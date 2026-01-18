import { useState, useEffect, useCallback, useRef } from 'react';
import { InventorySearchParams, InventoryDirectoryState } from '../types';
import { RawMaterialsService, FinishedProductsService } from '../services/inventory.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export const useInventory = (initialParams: InventorySearchParams = {}) => {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { tenant, membership, loading: tenantLoading } = useTenant();
  const tenantId = tenant?.id || null;
  const hasMembership = !!membership;
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
    // 🔥 CRITICAL: Don't fetch if user is not authenticated, tenant is loading, or no membership
    if (!firebaseUser || authLoading || tenantLoading || !hasMembership) {
      return;
    }

    const baseParams = params || currentParamsRef.current;
    const effectiveTenantId = baseParams.tenantId ?? tenantId;
    if (!effectiveTenantId) {
      return;
    }
    const searchParams: InventorySearchParams = {
      ...baseParams,
      tenantId: effectiveTenantId,
    };
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
  }, [firebaseUser, authLoading, tenantLoading, hasMembership, tenantId]);

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

  // Effect para cargar datos iniciales solo cuando el tenant esté listo
  // Using direct service call to avoid stale closure issues with fetchInventory
  useEffect(() => {
    // Only fetch when auth AND tenant are fully loaded AND membership exists
    if (authLoading || tenantLoading) {
      return;
    }
    
    if (!firebaseUser || !tenantId || !hasMembership) {
      return;
    }
    
    if (initialLoadDone.current) {
      return;
    }
    
    initialLoadDone.current = true;
    
    // Load data directly
    const loadInitialData = async () => {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      try {
        const result = await RawMaterialsService.searchRawMaterials({ 
          ...initialParams, 
          tenantId 
        });
        setState(prev => ({
          ...prev,
          rawMaterials: result.rawMaterials,
          totalCount: result.totalCount,
          loading: false,
          searchParams: { ...initialParams, tenantId },
          activeTab: 'raw-materials',
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error al cargar inventario',
        }));
      }
    };
    
    loadInitialData();
  }, [authLoading, tenantLoading, firebaseUser, tenantId, hasMembership, initialParams]);

  return {
    ...state,
    fetchInventory,
    updateSearchParams,
    switchTab,
    refresh,
  };
};