/**
 * ZADIA OS - Use Opportunities Hook
 * 
 * Manages opportunities state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { Opportunity } from '../types/sales.types';
import { OpportunityFormData } from '../validations/sales.schema';
import { OpportunitiesService } from '../services/opportunities.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';

interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  loading: boolean;
  error?: string;
  totalCount: number;
  searchOpportunities: () => Promise<void>;
  createOpportunity: (data: OpportunityFormData) => Promise<Opportunity>;
  updateOpportunity: (id: string, data: Partial<OpportunityFormData>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);

  const searchOpportunities = useCallback(async () => {
    if (!tenantId) return; // Wait for tenant
    
    try {
      setLoading(true);
      setError(undefined);

      const result = await OpportunitiesService.getOpportunities(tenantId);
      setOpportunities(result);
      setTotalCount(result.length);
    } catch (err) {
      const errorMessage = 'Error al buscar oportunidades';
      setError(errorMessage);
      logger.error('Error searching opportunities:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Reload when tenant changes
  useEffect(() => {
    if (tenantId) {
      searchOpportunities();
    }
  }, [tenantId, searchOpportunities]);

  const createOpportunity = useCallback(async (
    data: OpportunityFormData
  ): Promise<Opportunity> => {
    if (!tenantId) throw new Error('No tenant ID');
    
    try {
      setLoading(true);
      setError(undefined);

      const newOpportunity = await OpportunitiesService.createOpportunity(data, user?.uid || '', tenantId);
      
      setOpportunities(prev => [newOpportunity, ...prev]);
      setTotalCount(prev => prev + 1);

      return newOpportunity;
    } catch (err) {
      const errorMessage = 'Error al crear oportunidad';
      setError(errorMessage);
      logger.error('Error creating opportunity:', err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, tenantId]);

  const updateOpportunity = useCallback(async (
    id: string,
    data: Partial<OpportunityFormData>
  ) => {
    try {
      setError(undefined);

      await OpportunitiesService.updateOpportunity(id, data);
      
      // Refresh data after update
      await searchOpportunities();

      logger.info(`Opportunity updated: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al actualizar oportunidad';
      setError(errorMessage);
      logger.error('Error updating opportunity:', err as Error);
      throw err;
    }
  }, [searchOpportunities]);

  const deleteOpportunity = useCallback(async (id: string) => {
    try {
      setError(undefined);

      await OpportunitiesService.deleteOpportunity(id);
      
      setOpportunities(prev => prev.filter(opportunity => opportunity.id !== id));
      setTotalCount(prev => prev - 1);

      logger.info(`Opportunity deleted: ${id}`);
    } catch (err) {
      const errorMessage = 'Error al eliminar oportunidad';
      setError(errorMessage);
      logger.error('Error deleting opportunity:', err as Error);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await searchOpportunities();
  }, [searchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    totalCount,
    searchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refresh,
  };
}