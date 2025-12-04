'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { Tenant, CreateTenantData, UpdateTenantData } from '../types';
import {
  getTenantById,
  getUserTenants,
  createTenant,
  updateTenant,
} from '../services/tenant.service';

const CURRENT_TENANT_KEY = 'zadia_current_tenant';

interface UseTenantReturn {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  loading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant) => void;
  createNewTenant: (data: CreateTenantData) => Promise<Tenant>;
  updateCurrentTenant: (data: UpdateTenantData) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

/**
 * Hook for managing tenant state and operations
 */
export function useTenant(): UseTenantReturn {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user tenants
  const loadTenants = useCallback(async () => {
    if (!user?.uid) {
      setUserTenants([]);
      setCurrentTenantState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const tenants = await getUserTenants(user.uid);
      setUserTenants(tenants);

      // Try to restore last selected tenant
      const savedTenantId = localStorage.getItem(CURRENT_TENANT_KEY);
      
      if (savedTenantId) {
        const savedTenant = tenants.find(t => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentTenantState(savedTenant);
        } else if (tenants.length > 0) {
          setCurrentTenantState(tenants[0]);
        }
      } else if (tenants.length > 0) {
        setCurrentTenantState(tenants[0]);
      }
    } catch (err) {
      setError('Error loading tenants');
      logger.error('Error loading tenants', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initial load
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Set current tenant
  const setCurrentTenant = useCallback((tenant: Tenant) => {
    setCurrentTenantState(tenant);
    localStorage.setItem(CURRENT_TENANT_KEY, tenant.id);
  }, []);

  // Create new tenant
  const createNewTenant = useCallback(async (data: CreateTenantData): Promise<Tenant> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    const tenant = await createTenant(data, user.uid);
    
    // Refresh tenants list
    await loadTenants();
    
    // Set as current tenant
    setCurrentTenant(tenant);
    
    return tenant;
  }, [user?.uid, loadTenants, setCurrentTenant]);

  // Update current tenant
  const updateCurrentTenant = useCallback(async (data: UpdateTenantData): Promise<void> => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    await updateTenant(currentTenant.id, data);
    
    // Refresh to get updated data
    const updated = await getTenantById(currentTenant.id);
    if (updated) {
      setCurrentTenantState(updated);
      setUserTenants(prev => 
        prev.map(t => t.id === updated.id ? updated : t)
      );
    }
  }, [currentTenant]);

  return {
    currentTenant,
    userTenants,
    loading,
    error,
    setCurrentTenant,
    createNewTenant,
    updateCurrentTenant,
    refreshTenants: loadTenants,
  };
}
