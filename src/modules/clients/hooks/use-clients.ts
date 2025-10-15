import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientSearchParams, ClientDirectoryState } from '../types/clients.types';
import { ClientsService } from '../services/clients.service';

export const useClients = (initialParams: ClientSearchParams = {}) => {
  const [state, setState] = useState<ClientDirectoryState>({
    clients: [],
    loading: false,
    searchParams: { ...initialParams },
    totalCount: 0,
  });

  const currentParamsRef = useRef(state.searchParams);
  currentParamsRef.current = state.searchParams;

  // Ref para evitar múltiples cargas iniciales
  const initialLoadDone = useRef(false);

  const fetchClients = useCallback(async (params?: ClientSearchParams) => {
    const searchParams = params || currentParamsRef.current;
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
  }, []);

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

  // Effect para cargar datos iniciales solo una vez
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchClients(initialParams);
      initialLoadDone.current = true;
    }
  }, [fetchClients, initialParams]);

  return {
    ...state,
    fetchClients,
    updateSearchParams,
    refresh,
  };
};