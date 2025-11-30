import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  Module, 
  Action, 
  Permission, 
  SystemRole, 
  RoleDefinition,
  CustomRule,
} from '../types';
import { SYSTEM_ROLES, getRoleById } from '../types/role.types';

const CUSTOM_ROLES_COLLECTION = 'customRoles';

// ============================================
// Permission Checking
// ============================================

/**
 * Check if a role has permission for a specific action on a module
 */
export function hasPermission(
  roleId: SystemRole | string,
  module: Module,
  action: Action,
  customPermissions?: Permission[]
): boolean {
  // Check custom permissions first
  if (customPermissions) {
    const customPerm = customPermissions.find(p => p.module === module);
    if (customPerm && customPerm.actions.includes(action)) {
      return true;
    }
  }
  
  // Check role permissions
  const role = getRoleById(roleId);
  if (!role) {
    return false;
  }
  
  const permission = role.permissions.find(p => p.module === module);
  if (!permission) {
    return false;
  }
  
  return permission.actions.includes(action);
}

/**
 * Check if user can access a module (has any permission)
 */
export function canAccessModule(
  roleId: SystemRole | string,
  module: Module,
  customPermissions?: Permission[]
): boolean {
  // Check custom permissions first
  if (customPermissions) {
    const customPerm = customPermissions.find(p => p.module === module);
    if (customPerm && customPerm.actions.length > 0) {
      return true;
    }
  }
  
  const role = getRoleById(roleId);
  if (!role) {
    return false;
  }
  
  const permission = role.permissions.find(p => p.module === module);
  return permission !== undefined && permission.actions.length > 0;
}

/**
 * Get all allowed actions for a module
 */
export function getAllowedActions(
  roleId: SystemRole | string,
  module: Module,
  customPermissions?: Permission[]
): Action[] {
  const actions = new Set<Action>();
  
  // Add custom permission actions
  if (customPermissions) {
    const customPerm = customPermissions.find(p => p.module === module);
    if (customPerm) {
      customPerm.actions.forEach(a => actions.add(a));
    }
  }
  
  // Add role permission actions
  const role = getRoleById(roleId);
  if (role) {
    const permission = role.permissions.find(p => p.module === module);
    if (permission) {
      permission.actions.forEach(a => actions.add(a));
    }
  }
  
  return Array.from(actions);
}

/**
 * Get all accessible modules for a role
 */
export function getAccessibleModules(
  roleId: SystemRole | string,
  customPermissions?: Permission[]
): Module[] {
  const modules = new Set<Module>();
  
  // Add custom permission modules
  if (customPermissions) {
    customPermissions.forEach(p => {
      if (p.actions.length > 0) {
        modules.add(p.module);
      }
    });
  }
  
  // Add role permission modules
  const role = getRoleById(roleId);
  if (role) {
    role.permissions.forEach(p => {
      if (p.actions.length > 0) {
        modules.add(p.module);
      }
    });
  }
  
  return Array.from(modules);
}

// ============================================
// Custom Role Management
// ============================================

interface StoredCustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  customRules?: CustomRule[];
  isSystem: boolean;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface CreateRoleData {
  name: string;
  description?: string;
  permissions: Permission[];
  customRules?: CustomRule[];
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: Permission[];
  customRules?: CustomRule[];
}

/**
 * Create a custom role for a tenant
 */
export async function createCustomRole(
  tenantId: string,
  data: CreateRoleData,
  createdBy: string
): Promise<RoleDefinition> {
  const roleRef = doc(collection(db, CUSTOM_ROLES_COLLECTION));
  const now = Timestamp.now();
  
  const role: StoredCustomRole = {
    id: roleRef.id,
    name: data.name,
    description: data.description || '',
    permissions: data.permissions,
    customRules: data.customRules,
    isSystem: false,
    tenantId,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  
  await setDoc(roleRef, role);
  
  logger.info('Custom role created', { action: 'createCustomRole', metadata: { tenantId, roleId: role.id } });
  
  return {
    id: 'custom',
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    customRules: role.customRules,
    isSystem: false,
  };
}

/**
 * Get custom roles for a tenant
 */
export async function getCustomRoles(tenantId: string): Promise<RoleDefinition[]> {
  const q = query(
    collection(db, CUSTOM_ROLES_COLLECTION),
    where('tenantId', '==', tenantId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data() as StoredCustomRole;
    return {
      id: 'custom' as SystemRole,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      customRules: data.customRules,
      isSystem: false,
    };
  });
}

/**
 * Get all available roles for a tenant (system + custom)
 */
export async function getAllRoles(tenantId: string): Promise<RoleDefinition[]> {
  const systemRoles = SYSTEM_ROLES;
  const customRoles = await getCustomRoles(tenantId);
  
  return [...systemRoles, ...customRoles];
}

/**
 * Update a custom role
 */
export async function updateCustomRole(
  roleId: string,
  data: UpdateRoleData
): Promise<void> {
  const roleRef = doc(db, CUSTOM_ROLES_COLLECTION, roleId);
  const roleSnap = await getDoc(roleRef);
  
  if (!roleSnap.exists()) {
    throw new Error('Role not found');
  }
  
  const role = roleSnap.data() as StoredCustomRole;
  
  if (role.isSystem) {
    throw new Error('Cannot modify system roles');
  }
  
  await updateDoc(roleRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  
  logger.info('Custom role updated', { action: 'updateCustomRole', metadata: { roleId } });
}

/**
 * Delete a custom role
 */
export async function deleteCustomRole(roleId: string): Promise<void> {
  const roleRef = doc(db, CUSTOM_ROLES_COLLECTION, roleId);
  const roleSnap = await getDoc(roleRef);
  
  if (!roleSnap.exists()) {
    throw new Error('Role not found');
  }
  
  const role = roleSnap.data() as StoredCustomRole;
  
  if (role.isSystem) {
    throw new Error('Cannot delete system roles');
  }
  
  await deleteDoc(roleRef);
  
  logger.info('Custom role deleted', { action: 'deleteCustomRole', metadata: { roleId } });
}
