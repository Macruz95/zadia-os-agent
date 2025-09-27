/**
 * ZADIA OS - Use Leads Hook
 * 
 * Manages leads state and operations
 */

import { useState, useCallback } from 'react';
import { Lead, LeadFilters } from '../types/sales.types';
import { LeadFormData } from '../validations/sales.schema';
import { LeadsService } from '../services/leads.service';
import { logger } from '@/lib/logger';

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchLeads: (filters?: LeadFilters, reset?: boolean) => Promise<void>;
  createLead: (data: LeadFormData, createdBy: string) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  convertLead: (id: string) => Promise<{ clientId: string; opportunityId: string }>;
  disqualifyLead: (id: string, reason: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadScore: (id: string, score: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<LeadFilters>({});

  const searchLeads = useCallback(async (
    filters: LeadFilters = {},
    reset: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(undefined);

      if (reset) {
        setLeads([]);
        setCurrentFilters(filters);
      }

      const result = await LeadsService.searchLeads(filters);
      
      if (reset) {
        setLeads(result.leads);
      } else {
        setLeads(prev => [...prev, ...result.leads]);
      }
      
      setTotalCount(result.totalCount);
      setCurrentFilters(filters);
    } catch (err) {
      const errorMessage = 'Error al buscar leads';
      setError(errorMessage);
      logger.error('Error searching leads:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (
    data: LeadFormData,
    createdBy: string
  ): Promise<Lead> => {
    try {
      setLoading(true);
      setError(undefined);

      const newLead = await LeadsService.createLead(data, createdBy);
      
      // Add to current list if it matches filters
      setLeads(prev => [newLead, ...prev]);
      setTotalCount(prev => prev + 1);

      return newLead;
    } catch (err) {
      const errorMessage = 'Error al crear lead';
      setError(errorMessage);
      logger.error('Error creating lead:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLead = useCallback(async (
    id: string,
    data: Partial<Lead>
  ) => {
    try {
      setError(undefined);

      await LeadsService.updateLead(id, data);
      
      // Update in current list
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, ...data } : lead
      ));

      logger.info(`Lead updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar lead';
      setError(errorMessage);
      logger.error('Error updating lead:', err as Error);
      throw err;
    }
  }, []);

  const convertLead = useCallback(async (id: string) => {
    try {
      setError(undefined);

      const result = await LeadsService.convertLead(id);
      
      // Update lead status in list
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, status: 'converted' } : lead
      ));

      logger.info(`Lead converted: ${id}`);
      return result;
    } catch (err) {
      const errorMessage = 'Error al convertir lead';
      setError(errorMessage);
      logger.error('Error converting lead:', err as Error);
      throw err;
    }
  }, []);

  const disqualifyLead = useCallback(async (id: string, reason: string) => {
    try {
      setError(undefined);

      await LeadsService.disqualifyLead(id, reason);
      
      // Update lead status in list
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, status: 'disqualified' } : lead
      ));

      logger.info(`Lead disqualified: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al descalificar lead';
      setError(errorMessage);
      logger.error('Error disqualifying lead:', err as Error);
      throw err;
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await LeadsService.deleteLead(id);
      
      // Remove from list
      setLeads(prev => prev.filter(lead => lead.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Lead deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar lead';
      setError(errorMessage);
      logger.error('Error deleting lead:', err as Error);
      throw err;
    }
  }, []);

  const updateLeadScore = useCallback(async (id: string, score: number) => {
    try {
      setError(undefined);

      await LeadsService.updateLeadScore(id, score);
      
      // Update score and priority in list
      const priority = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, score, priority } : lead
      ));

      logger.info(`Lead score updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar puntuación';
      setError(errorMessage);
      logger.error('Error updating lead score:', err as Error);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await searchLeads(currentFilters, true);
  }, [currentFilters, searchLeads]);

  return {
    leads,
    loading,
    error,
    totalCount,
    searchLeads,
    createLead,
    updateLead,
    convertLead,
    disqualifyLead,
    deleteLead,
    updateLeadScore,
    refresh,
  };
}