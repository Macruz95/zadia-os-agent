import { useState, useEffect, useCallback } from 'react';
import { ClientProfileState } from '../types/clients.types';
import {
  getClient,
  getContactsByClient,
  getInteractionsByClient,
  getTransactionsByClient,
  getProjectsByClient,
  getQuotesByClient,
  getMeetingsByClient,
  getTasksByClient,
} from '../services/clients.service';

export const useClientProfile = (clientId: string | null) => {
  const [state, setState] = useState<ClientProfileState>({
    contacts: [],
    interactions: [],
    transactions: [],
    projects: [],
    quotes: [],
    meetings: [],
    tasks: [],
    loading: false,
  });

  const fetchClientProfile = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const [
        client,
        contacts,
        interactions,
        transactions,
        projects,
        quotes,
        meetings,
        tasks,
      ] = await Promise.all([
        getClient(id),
        getContactsByClient(id),
        getInteractionsByClient(id),
        getTransactionsByClient(id),
        getProjectsByClient(id),
        getQuotesByClient(id),
        getMeetingsByClient(id),
        getTasksByClient(id),
      ]);

      setState({
        client: client || undefined,
        contacts,
        interactions,
        transactions,
        projects,
        quotes,
        meetings,
        tasks,
        loading: false,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar perfil del cliente',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    if (clientId) {
      fetchClientProfile(clientId);
    }
  }, [clientId, fetchClientProfile]);

  useEffect(() => {
    if (clientId) {
      fetchClientProfile(clientId);
    } else {
      setState({
        contacts: [],
        interactions: [],
        transactions: [],
        projects: [],
        quotes: [],
        meetings: [],
        tasks: [],
        loading: false,
      });
    }
  }, [clientId, fetchClientProfile]);

  return {
    ...state,
    refresh,
  };
};