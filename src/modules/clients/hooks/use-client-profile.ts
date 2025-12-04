import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useTenantId } from '@/contexts/TenantContext';
import { ClientProfileState } from '../types/clients.types';
import { ClientsService } from '../services/clients.service';
import { ContactsService } from '../services/entities/contacts-entity.service';
import { InteractionsService } from '../services/entities/interactions-entity.service';
import { ClientActivitiesService } from '../services/client-activities.service';

export const useClientProfile = (clientId: string | null) => {
  const tenantId = useTenantId();
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
    if (!tenantId) {
      setState(prev => ({ ...prev, loading: false, error: 'No tenant selected' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const [
        client,
        contacts,
        interactions,
        projects,
        quotes,
        transactions,
        tasks,
        meetings
      ] = await Promise.all([
        ClientsService.getClientById(id),
        ContactsService.getContactsByClient(id, tenantId),
        InteractionsService.getInteractionsByClient(id, 10, tenantId),
        ClientActivitiesService.getClientProjects(id, tenantId),
        ClientActivitiesService.getClientQuotes(id, tenantId),
        ClientActivitiesService.getClientTransactions(id, tenantId),
        ClientActivitiesService.getClientTasks(id, tenantId),
        ClientActivitiesService.getClientMeetings(id, tenantId)
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