import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientSearchParams, ClientDirectoryState } from '../types/clients.types';
import { searchClients } from '../services/clients.service';

export const useClients = (initialParams: ClientSearchParams = {}) => {
  const [state, setState] = useState<ClientDirectoryState>({
    clients: [],
    loading: false,
    searchParams: { ...initialParams },
    totalCount: 0,
  });

  const currentParamsRef = useRef(state.searchParams);
  currentParamsRef.current = state.searchParams;

  const fetchClients = useCallback(async (params?: ClientSearchParams) => {
    const searchParams = params || currentParamsRef.current;
    console.log('use-clients: fetchClients called with params:', searchParams);
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const result = await searchClients(searchParams);
      console.log('use-clients: searchClients result:', result);
      setState(prev => ({
        ...prev,
        clients: result.clients,
        totalCount: result.totalCount,
        loading: false,
        searchParams,
      }));
    } catch (error) {
      console.error('use-clients: Error fetching clients:', error);
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

  // Effect para cargar datos iniciales
  useEffect(() => {
    fetchClients(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  return {
    ...state,
    fetchClients,
    updateSearchParams,
    refresh,
  };
};