'use client';

import { ReactNode } from 'react';
import { Module, Action } from '../types';
import { usePermissions } from '../hooks/use-permissions';

interface PermissionGateProps {
  /**
   * The module to check permissions for
   */
  module: Module;
  /**
   * The action required (optional - if not provided, checks for any access)
   */
  action?: Action;
  /**
   * Content to show when user has permission
   */
  children: ReactNode;
  /**
   * Content to show when user doesn't have permission (optional)
   */
  fallback?: ReactNode;
  /**
   * If true, shows nothing instead of fallback when no permission
   */
  hideOnNoPermission?: boolean;
}

/**
 * Component that conditionally renders content based on user permissions
 * 
 * @example
 * // Only show delete button if user can delete clients
 * <PermissionGate module="clients" action="delete">
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGate>
 * 
 * @example
 * // Show different content based on permission
 * <PermissionGate 
 *   module="finance" 
 *   action="approve"
 *   fallback={<span>Pending approval</span>}
 * >
 *   <Button onClick={handleApprove}>Approve</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
  hideOnNoPermission = false,
}: PermissionGateProps) {
  const { can, canAccess } = usePermissions();
  
  // Check permission
  const hasAccess = action ? can(module, action) : canAccess(module);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (hideOnNoPermission) {
    return null;
  }
  
  return <>{fallback}</>;
}

interface RequirePermissionProps {
  /**
   * Array of required permissions (module + action pairs)
   */
  permissions: Array<{ module: Module; action: Action }>;
  /**
   * Whether ALL permissions are required (default) or just one
   */
  requireAll?: boolean;
  /**
   * Content to show when user has permission
   */
  children: ReactNode;
  /**
   * Content to show when user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * Component that requires multiple permissions
 * 
 * @example
 * // Require both create and edit permissions
 * <RequirePermission 
 *   permissions={[
 *     { module: 'clients', action: 'create' },
 *     { module: 'clients', action: 'edit' }
 *   ]}
 * >
 *   <ManageClientsForm />
 * </RequirePermission>
 */
export function RequirePermission({
  permissions,
  requireAll = true,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { can } = usePermissions();
  
  const hasPermission = requireAll
    ? permissions.every(p => can(p.module, p.action))
    : permissions.some(p => can(p.module, p.action));
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
