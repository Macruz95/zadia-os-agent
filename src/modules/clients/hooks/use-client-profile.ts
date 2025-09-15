import { useState, useEffect, useCallback } from 'react';
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
    console.log('🔍 Fetching client profile for ID:', id);
    console.log('🔍 Client ID type:', typeof id);
    console.log('🔍 Client ID length:', id.length);
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

      console.log('✅ Client profile loaded:', { 
        client: !!client, 
        clientId: client?.id,
        contactsCount: contacts.length, 
        interactionsCount: interactions.length 
      });
      console.log('📋 Client data:', client);
      console.log('👥 Contacts data:', contacts);

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
      console.error('❌ Error loading client profile:', error);
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
    console.log('🔄 useClientProfile useEffect triggered with clientId:', clientId);
    if (clientId) {
      fetchClientProfile(clientId);
    } else {
      console.log('⚠️ No clientId provided, resetting state');
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