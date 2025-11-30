'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Module, Action, Permission } from '../types';
import { 
  hasPermission, 
  canAccessModule, 
  getAllowedActions, 
  getAccessibleModules 
} from '../services/permission.service';

interface UsePermissionsReturn {
  can: (module: Module, action: Action) => boolean;
  canAccess: (module: Module) => boolean;
  allowedActions: (module: Module) => Action[];
  accessibleModules: Module[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook for checking user permissions
 */
export function usePermissions(customPermissions?: Permission[]): UsePermissionsReturn {
  const { user } = useAuth();
  
  // Get user role (default to 'viewer' if not set)
  const userRole = user?.role || 'viewer';
  
  // Check if user can perform action on module
  const can = useCallback((module: Module, action: Action): boolean => {
    return hasPermission(userRole, module, action, customPermissions);
  }, [userRole, customPermissions]);
  
  // Check if user can access a module
  const canAccess = useCallback((module: Module): boolean => {
    return canAccessModule(userRole, module, customPermissions);
  }, [userRole, customPermissions]);
  
  // Get allowed actions for a module
  const allowedActions = useCallback((module: Module): Action[] => {
    return getAllowedActions(userRole, module, customPermissions);
  }, [userRole, customPermissions]);
  
  // Get all accessible modules
  const accessibleModules = useMemo((): Module[] => {
    return getAccessibleModules(userRole, customPermissions);
  }, [userRole, customPermissions]);
  
  // Check if user is admin
  const isAdmin = useMemo((): boolean => {
    return userRole === 'admin' || userRole === 'super_admin';
  }, [userRole]);
  
  // Check if user is super admin
  const isSuperAdmin = useMemo((): boolean => {
    return userRole === 'super_admin';
  }, [userRole]);
  
  return {
    can,
    canAccess,
    allowedActions,
    accessibleModules,
    isAdmin,
    isSuperAdmin,
  };
}

/**
 * Hook for checking a single permission
 */
export function useCanAccess(module: Module, action?: Action): boolean {
  const { can, canAccess } = usePermissions();
  
  if (action) {
    return can(module, action);
  }
  
  return canAccess(module);
}
