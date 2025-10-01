import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { ClientProfileState } from '../types/clients.types';
import {
  getClient,
  getContactsByClient,
  getInteractionsByClient,
} from '../services/clients.service';

export const useClientProfile = (clientId: string | null) => {
  const [state, setState] = useState<ClientProfileState>({
    client: undefined,
    contacts: [],
    interactions: [],
    transactions: [],
    projects: [],
    quotes: [],
    meetings: [],
    tasks: [],
    loading: false,
    error: undefined,
  });

  const fetchClientProfile = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const [
        client,
        contacts,
        interactions,
      ] = await Promise.all([
        getClient(id),
        getContactsByClient(id),
        getInteractionsByClient(id),
      ]);

      setState({
        client: client || undefined,
        contacts,
        interactions,
        transactions: [], // Empty until implemented
        projects: [], // Empty until implemented
        quotes: [], // Empty until implemented
        meetings: [], // Empty until implemented
        tasks: [], // Empty until implemented
        loading: false,
      });
    } catch (error) {
      logger.error('Error loading client profile', error as Error, {
        component: 'use-client-profile',
        action: 'loadProfile',
        metadata: { clientId }
      });
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar perfil del cliente',
      }));
    }
  }, [clientId]);

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
        client: undefined,
        contacts: [],
        interactions: [],
        transactions: [],
        projects: [],
        quotes: [],
        meetings: [],
        tasks: [],
        loading: false,
        error: undefined,
      });
    }
  }, [clientId, fetchClientProfile]);

  return {
    ...state,
    refresh,
  };
};