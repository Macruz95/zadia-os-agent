import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientSearchParams, ClientDirectoryState } from '../types/clients.types';
import { ClientsService } from '../services/clients.service';
import { useTenantId } from '@/contexts/TenantContext';

export const useClients = (initialParams: ClientSearchParams = {}) => {
  const tenantId = useTenantId();
  const [state, setState] = useState<ClientDirectoryState>({
    clients: [],
    loading: false,
    searchParams: { ...initialParams },
    totalCount: 0,
  });

  const currentParamsRef = useRef(state.searchParams);
  currentParamsRef.current = state.searchParams;

  const fetchClients = useCallback(async (params?: ClientSearchParams) => {
    // Don't fetch if no tenant selected
    if (!tenantId) {
      setState(prev => ({ ...prev, clients: [], loading: false, totalCount: 0 }));
      return;
    }
    
    const searchParams = { ...params || currentParamsRef.current, tenantId };
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const result = await ClientsService.searchClients(searchParams);
      setState(prev => ({
        ...prev,
        clients: result.clients,
        totalCount: result.totalCount,
        loading: false,
        searchParams,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar clientes',
      }));
    }
  }, [tenantId]);

  const updateSearchParams = useCallback((newParams: Partial<ClientSearchParams>) => {
    setState(prev => {
      const updatedParams = { ...prev.searchParams, ...newParams };
      fetchClients(updatedParams);
      return { ...prev, searchParams: updatedParams };
    });
  }, [fetchClients]);

  const refresh = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  // Effect para cargar datos cuando cambie el tenant
  useEffect(() => {
    if (tenantId) {
      fetchClients(initialParams);
    }
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    tenantId,
    fetchClients,
    updateSearchParams,
    refresh,
  };
};