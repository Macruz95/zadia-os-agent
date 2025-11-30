/**
 * ZADIA OS - Tenant Context
 * 
 * Global tenant state management for multi-tenancy
 * REGLA 1: Real Firebase data
 * REGLA 4: Modular architecture
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  createTenant as createTenantInDB,
  getTenantById,
  getUserTenants 
} from '@/modules/tenants/services/tenant.service';
import { getTenantMember } from '@/modules/tenants/services/tenant-member.service';
import type { Tenant, TenantMember, TenantRole } from '@/modules/tenants/types/tenant.types';
import { logger } from '@/lib/logger';

interface TenantContextType {
  /** Current active tenant */
  tenant: Tenant | null;
  /** Current user's membership in the tenant */
  membership: TenantMember | null;
  /** Current user's role in the tenant */
  role: TenantRole | null;
  /** All tenants the user belongs to */
  userTenants: Tenant[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Switch to a different tenant */
  switchTenant: (tenantId: string) => Promise<void>;
  /** Create a new tenant */
  createTenant: (name: string, slug: string) => Promise<Tenant>;
  /** Refresh tenant data */
  refreshTenant: () => Promise<void>;
  /** Check if user has specific role */
  hasRole: (roles: TenantRole | TenantRole[]) => boolean;
  /** Check if user is owner */
  isOwner: boolean;
  /** Check if user is admin or higher */
  isAdmin: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'zadia_active_tenant';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [membership, setMembership] = useState<TenantMember | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's tenants
  const loadUserTenants = useCallback(async (userId: string) => {
    try {
      const tenants = await getUserTenants(userId);
      setUserTenants(tenants);
      return tenants;
    } catch (err) {
      logger.error('Failed to load user tenants', err as Error);
      return [];
    }
  }, []);

  // Load membership for current tenant
  const loadMembership = useCallback(async (tenantId: string, userId: string) => {
    try {
      const member = await getTenantMember(tenantId, userId);
      setMembership(member);
      return member;
    } catch (err) {
      logger.error('Failed to load membership', err as Error);
      return null;
    }
  }, []);

  // Switch to a different tenant
  const switchTenant = useCallback(async (tenantId: string) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const newTenant = await getTenantById(tenantId);
      if (!newTenant) {
        throw new Error('Tenant not found');
      }

      const member = await loadMembership(tenantId, user.uid);
      if (!member) {
        throw new Error('No membership in this tenant');
      }

      setTenant(newTenant);
      localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      logger.error('Failed to switch tenant', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadMembership]);

  // Create a new tenant
  const createTenant = useCallback(async (name: string, slug: string): Promise<Tenant> => {
    if (!user?.uid) {
      throw new Error('Not authenticated');
    }

    const newTenant = await createTenantInDB(
      {
        name,
        slug,
        plan: 'free',
        settings: {
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: (navigator.language?.startsWith('es') ? 'es' : 'en') as 'es' | 'en',
          locale: navigator.language || 'en',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          features: {
            multiUser: false,
            advancedReporting: false,
            apiAccess: false,
            customBranding: false,
          },
        },
      },
      user.uid
    );

    // Refresh tenants list
    await loadUserTenants(user.uid);
    
    // Switch to new tenant
    await switchTenant(newTenant.id);

    return newTenant;
  }, [user?.uid, loadUserTenants, switchTenant]);

  // Refresh current tenant data
  const refreshTenant = useCallback(async () => {
    if (!tenant?.id || !user?.uid) return;

    try {
      const [refreshedTenant, refreshedMembership] = await Promise.all([
        getTenantById(tenant.id),
        getTenantMember(tenant.id, user.uid),
      ]);

      if (refreshedTenant) setTenant(refreshedTenant);
      if (refreshedMembership) setMembership(refreshedMembership);
    } catch (err) {
      logger.error('Failed to refresh tenant', err as Error);
    }
  }, [tenant?.id, user?.uid]);

  // Check if user has specific role(s)
  const hasRole = useCallback((roles: TenantRole | TenantRole[]): boolean => {
    if (!membership?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(membership.role);
  }, [membership?.role]);

  // Role convenience checks
  const isOwner = membership?.role === 'owner';
  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin';

  // Initialize tenant on auth change
  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      setTenant(null);
      setMembership(null);
      setUserTenants([]);
      setLoading(false);
      return;
    }

    const initializeTenant = async () => {
      setLoading(true);
      try {
        const tenants = await loadUserTenants(user.uid);

        if (tenants.length === 0) {
          // No tenants - user needs to create one or be invited
          setTenant(null);
          setMembership(null);
          setLoading(false);
          return;
        }

        // Try to restore last active tenant
        const savedTenantId = localStorage.getItem(TENANT_STORAGE_KEY);
        const savedTenant = savedTenantId 
          ? tenants.find((t: Tenant) => t.id === savedTenantId)
          : null;

        // Use saved tenant or first available
        const activeTenant = savedTenant || tenants[0];
        setTenant(activeTenant);

        // Load membership
        await loadMembership(activeTenant.id, user.uid);
        
        localStorage.setItem(TENANT_STORAGE_KEY, activeTenant.id);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        logger.error('Failed to initialize tenant', err as Error);
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, [user?.uid, authLoading, loadUserTenants, loadMembership]);

  const value: TenantContextType = {
    tenant,
    membership,
    role: membership?.role || null,
    userTenants,
    loading,
    error,
    switchTenant,
    createTenant,
    refreshTenant,
    hasRole,
    isOwner,
    isAdmin,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to get just the tenant ID (for queries)
 */
export function useTenantId(): string | null {
  const { tenant } = useTenant();
  return tenant?.id || null;
}
