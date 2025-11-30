/**
 * ZADIA OS - Audit Trail Service
 * 
 * Complete audit logging for all system actions
 * REGLA 1: Real Firebase data
 * REGLA 4: Modular architecture
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const AUDIT_COLLECTION = 'auditLogs';

// ============================================
// Types
// ============================================
export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'send'
  | 'archive'
  | 'restore';

export type AuditModule = 
  | 'clients'
  | 'leads'
  | 'opportunities'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'projects'
  | 'tasks'
  | 'inventory'
  | 'employees'
  | 'orders'
  | 'settings'
  | 'users'
  | 'tenants'
  | 'auth';

export interface AuditLogEntry {
  id?: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  module: AuditModule;
  resourceId?: string;
  resourceName?: string;
  description: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    fields?: string[];
  };
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  };
  timestamp: Timestamp;
  severity: 'info' | 'warning' | 'critical';
}

export interface AuditLogFilter {
  tenantId: string;
  userId?: string;
  module?: AuditModule;
  action?: AuditAction;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: 'info' | 'warning' | 'critical';
}

// ============================================
// Log Actions
// ============================================

/**
 * Log an audit entry
 */
export async function logAuditEntry(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), {
      ...entry,
      timestamp: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    logger.error('Failed to log audit entry', error as Error);
    return null;
  }
}

/**
 * Log a create action
 */
export async function logCreate(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: AuditModule;
  resourceId: string;
  resourceName: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEntry({
    tenantId: params.tenantId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: 'create',
    module: params.module,
    resourceId: params.resourceId,
    resourceName: params.resourceName,
    description: `${params.userName} creó ${getModuleName(params.module)}: ${params.resourceName}`,
    changes: params.data ? { after: params.data } : undefined,
    severity: 'info',
  });
}

/**
 * Log an update action
 */
export async function logUpdate(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: AuditModule;
  resourceId: string;
  resourceName: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  fields?: string[];
}): Promise<void> {
  const changedFields = params.fields || Object.keys(params.after || {});
  
  await logAuditEntry({
    tenantId: params.tenantId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: 'update',
    module: params.module,
    resourceId: params.resourceId,
    resourceName: params.resourceName,
    description: `${params.userName} actualizó ${getModuleName(params.module)}: ${params.resourceName} (${changedFields.join(', ')})`,
    changes: {
      before: params.before,
      after: params.after,
      fields: changedFields,
    },
    severity: 'info',
  });
}

/**
 * Log a delete action
 */
export async function logDelete(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: AuditModule;
  resourceId: string;
  resourceName: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEntry({
    tenantId: params.tenantId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: 'delete',
    module: params.module,
    resourceId: params.resourceId,
    resourceName: params.resourceName,
    description: `${params.userName} eliminó ${getModuleName(params.module)}: ${params.resourceName}`,
    changes: params.data ? { before: params.data } : undefined,
    severity: 'warning',
  });
}

/**
 * Log a login action
 */
export async function logLogin(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  metadata?: { ip?: string; userAgent?: string };
}): Promise<void> {
  await logAuditEntry({
    tenantId: params.tenantId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: 'login',
    module: 'auth',
    description: `${params.userName} inició sesión`,
    metadata: params.metadata,
    severity: 'info',
  });
}

/**
 * Log an export action
 */
export async function logExport(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: AuditModule;
  format: string;
  recordCount: number;
}): Promise<void> {
  await logAuditEntry({
    tenantId: params.tenantId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: 'export',
    module: params.module,
    description: `${params.userName} exportó ${params.recordCount} registros de ${getModuleName(params.module)} a ${params.format}`,
    severity: 'info',
  });
}

/**
 * Log a critical action (delete tenant, change permissions, etc.)
 */
export async function logCriticalAction(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  module: AuditModule;
  description: string;
  resourceId?: string;
  resourceName?: string;
}): Promise<void> {
  await logAuditEntry({
    ...params,
    severity: 'critical',
  });
}

// ============================================
// Query Logs
// ============================================

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  filter: AuditLogFilter,
  pageSize: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ logs: AuditLogEntry[]; lastDoc: DocumentSnapshot | null }> {
  try {
    let q = query(
      collection(db, AUDIT_COLLECTION),
      where('tenantId', '==', filter.tenantId),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );

    if (filter.userId) {
      q = query(q, where('userId', '==', filter.userId));
    }
    
    if (filter.module) {
      q = query(q, where('module', '==', filter.module));
    }
    
    if (filter.action) {
      q = query(q, where('action', '==', filter.action));
    }
    
    if (filter.severity) {
      q = query(q, where('severity', '==', filter.severity));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    const logs: AuditLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AuditLogEntry));

    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;

    return { logs, lastDoc: newLastDoc };
  } catch (error) {
    logger.error('Failed to get audit logs', error as Error);
    return { logs: [], lastDoc: null };
  }
}

/**
 * Get recent activity for a resource
 */
export async function getResourceHistory(
  tenantId: string,
  module: AuditModule,
  resourceId: string,
  maxEntries: number = 20
): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where('tenantId', '==', tenantId),
      where('module', '==', module),
      where('resourceId', '==', resourceId),
      orderBy('timestamp', 'desc'),
      limit(maxEntries)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AuditLogEntry));
  } catch (error) {
    logger.error('Failed to get resource history', error as Error);
    return [];
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  tenantId: string,
  userId: string,
  days: number = 30
): Promise<{ action: AuditAction; count: number }[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, AUDIT_COLLECTION),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);
    
    const actionCounts: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const action = doc.data().action as AuditAction;
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    return Object.entries(actionCounts).map(([action, count]) => ({
      action: action as AuditAction,
      count,
    }));
  } catch (error) {
    logger.error('Failed to get user activity summary', error as Error);
    return [];
  }
}

// ============================================
// Helpers
// ============================================

function getModuleName(module: AuditModule): string {
  const names: Record<AuditModule, string> = {
    clients: 'Cliente',
    leads: 'Lead',
    opportunities: 'Oportunidad',
    quotes: 'Cotización',
    invoices: 'Factura',
    payments: 'Pago',
    projects: 'Proyecto',
    tasks: 'Tarea',
    inventory: 'Producto',
    employees: 'Empleado',
    orders: 'Orden',
    settings: 'Configuración',
    users: 'Usuario',
    tenants: 'Organización',
    auth: 'Autenticación',
  };
  
  return names[module] || module;
}

/**
 * Create audit context for use in hooks
 */
export function createAuditContext(params: {
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
}) {
  return {
    logCreate: (p: Omit<Parameters<typeof logCreate>[0], 'tenantId' | 'userId' | 'userEmail' | 'userName'>) =>
      logCreate({ ...params, ...p }),
    logUpdate: (p: Omit<Parameters<typeof logUpdate>[0], 'tenantId' | 'userId' | 'userEmail' | 'userName'>) =>
      logUpdate({ ...params, ...p }),
    logDelete: (p: Omit<Parameters<typeof logDelete>[0], 'tenantId' | 'userId' | 'userEmail' | 'userName'>) =>
      logDelete({ ...params, ...p }),
    logExport: (p: Omit<Parameters<typeof logExport>[0], 'tenantId' | 'userId' | 'userEmail' | 'userName'>) =>
      logExport({ ...params, ...p }),
    logCriticalAction: (p: Omit<Parameters<typeof logCriticalAction>[0], 'tenantId' | 'userId' | 'userEmail' | 'userName'>) =>
      logCriticalAction({ ...params, ...p }),
  };
}
