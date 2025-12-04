/**
 * ZADIA OS - Tenant Guard
 * 
 * Componente que verifica si el usuario tiene un tenant activo.
 * Si no tiene, muestra el onboarding para crear uno.
 */

'use client';

import { useTenant } from '@/contexts/TenantContext';
import { TenantOnboarding } from '@/components/onboarding/TenantOnboarding';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

interface TenantGuardProps {
  children: React.ReactNode;
}

export function TenantGuard({ children }: TenantGuardProps) {
  const { tenant, loading, userTenants } = useTenant();

  // Show loading while tenant context initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <p className="text-sm text-gray-500">Cargando empresa...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding if user has no tenants
  if (!tenant && userTenants.length === 0) {
    return <TenantOnboarding />;
  }

  // User has tenant, show normal content
  return <>{children}</>;
}
