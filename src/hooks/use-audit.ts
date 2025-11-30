/**
 * ZADIA OS - Use Audit Hook
 * 
 * React hook for audit logging
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { 
  logCreate, 
  logUpdate, 
  logDelete, 
  logExport,
  AuditModule 
} from '@/services/audit-trail.service';

export function useAudit() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const auditContext = useMemo(() => ({
    tenantId: tenant?.id || '',
    userId: user?.uid || '',
    userEmail: user?.email || '',
    userName: user?.displayName || user?.email || 'Usuario',
  }), [tenant?.id, user?.uid, user?.email, user?.displayName]);

  const auditCreate = useCallback(async (
    module: AuditModule,
    resourceId: string,
    resourceName: string,
    data?: Record<string, unknown>
  ) => {
    if (!auditContext.tenantId || !auditContext.userId) return;
    
    await logCreate({
      ...auditContext,
      module,
      resourceId,
      resourceName,
      data,
    });
  }, [auditContext]);

  const auditUpdate = useCallback(async (
    module: AuditModule,
    resourceId: string,
    resourceName: string,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>,
    fields?: string[]
  ) => {
    if (!auditContext.tenantId || !auditContext.userId) return;
    
    await logUpdate({
      ...auditContext,
      module,
      resourceId,
      resourceName,
      before,
      after,
      fields,
    });
  }, [auditContext]);

  const auditDelete = useCallback(async (
    module: AuditModule,
    resourceId: string,
    resourceName: string,
    data?: Record<string, unknown>
  ) => {
    if (!auditContext.tenantId || !auditContext.userId) return;
    
    await logDelete({
      ...auditContext,
      module,
      resourceId,
      resourceName,
      data,
    });
  }, [auditContext]);

  const auditExport = useCallback(async (
    module: AuditModule,
    format: string,
    recordCount: number
  ) => {
    if (!auditContext.tenantId || !auditContext.userId) return;
    
    await logExport({
      ...auditContext,
      module,
      format,
      recordCount,
    });
  }, [auditContext]);

  return {
    auditCreate,
    auditUpdate,
    auditDelete,
    auditExport,
  };
}
