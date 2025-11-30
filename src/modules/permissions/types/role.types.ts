import { RoleDefinition, Permission } from './permission.types';

/**
 * ZADIA OS - Role Definitions
 * Predefined system roles with their permissions
 */

// ============================================
// Helper to create full access permission
// ============================================
const fullAccess = (module: string): Permission => ({
  module: module as Permission['module'],
  actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
});

const viewOnly = (module: string): Permission => ({
  module: module as Permission['module'],
  actions: ['view'],
});

const viewAndExport = (module: string): Permission => ({
  module: module as Permission['module'],
  actions: ['view', 'export'],
});

const crudAccess = (module: string): Permission => ({
  module: module as Permission['module'],
  actions: ['view', 'create', 'edit', 'delete'],
});

// ============================================
// System Roles
// ============================================
export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Administrador',
    description: 'Acceso total a todas las funcionalidades del sistema',
    isSystem: true,
    permissions: [
      fullAccess('dashboard'),
      fullAccess('clients'),
      fullAccess('sales'),
      fullAccess('inventory'),
      fullAccess('finance'),
      fullAccess('hr'),
      fullAccess('projects'),
      fullAccess('orders'),
      fullAccess('calendar'),
      fullAccess('tasks'),
      fullAccess('workflows'),
      fullAccess('ai-assistant'),
      fullAccess('settings'),
      fullAccess('admin'),
    ],
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Gestión completa excepto configuración del sistema',
    isSystem: true,
    permissions: [
      fullAccess('dashboard'),
      fullAccess('clients'),
      fullAccess('sales'),
      fullAccess('inventory'),
      fullAccess('finance'),
      fullAccess('hr'),
      fullAccess('projects'),
      fullAccess('orders'),
      fullAccess('calendar'),
      fullAccess('tasks'),
      fullAccess('workflows'),
      viewOnly('ai-assistant'),
      viewOnly('settings'),
      { module: 'admin', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Supervisión y aprobación de operaciones',
    isSystem: true,
    permissions: [
      viewAndExport('dashboard'),
      crudAccess('clients'),
      { module: 'sales', actions: ['view', 'create', 'edit', 'approve', 'export'] },
      { module: 'inventory', actions: ['view', 'approve', 'export'] },
      { module: 'finance', actions: ['view', 'approve', 'export'] },
      viewOnly('hr'),
      { module: 'projects', actions: ['view', 'create', 'edit', 'approve', 'export'] },
      { module: 'orders', actions: ['view', 'approve', 'export'] },
      crudAccess('calendar'),
      crudAccess('tasks'),
      viewOnly('workflows'),
      viewOnly('ai-assistant'),
    ],
  },
  {
    id: 'accountant',
    name: 'Contador',
    description: 'Acceso a módulos financieros y reportes',
    isSystem: true,
    permissions: [
      viewAndExport('dashboard'),
      viewAndExport('clients'),
      viewAndExport('sales'),
      viewAndExport('inventory'),
      { module: 'finance', actions: ['view', 'create', 'edit', 'approve', 'export'] },
      { module: 'hr', actions: ['view', 'export'] }, // Can see payroll
      viewOnly('projects'),
      viewAndExport('orders'),
      viewOnly('ai-assistant'),
    ],
    customRules: [
      {
        type: 'field',
        module: 'hr',
        rule: 'allow:salary,payroll',
        description: 'Puede ver información de salarios y nómina',
      },
    ],
  },
  {
    id: 'sales',
    name: 'Ventas',
    description: 'Gestión de clientes, leads y cotizaciones',
    isSystem: true,
    permissions: [
      viewOnly('dashboard'),
      crudAccess('clients'),
      { module: 'sales', actions: ['view', 'create', 'edit', 'export'] },
      viewOnly('inventory'),
      viewOnly('finance'),
      viewOnly('projects'),
      { module: 'orders', actions: ['view', 'create'] },
      crudAccess('calendar'),
      crudAccess('tasks'),
      viewOnly('ai-assistant'),
    ],
    customRules: [
      {
        type: 'record',
        module: 'sales',
        rule: 'own-records-only',
        description: 'Solo puede ver sus propios leads y oportunidades',
      },
    ],
  },
  {
    id: 'hr',
    name: 'Recursos Humanos',
    description: 'Gestión de personal y nómina',
    isSystem: true,
    permissions: [
      viewOnly('dashboard'),
      viewOnly('clients'),
      viewOnly('sales'),
      viewOnly('inventory'),
      viewOnly('finance'),
      { module: 'hr', actions: ['view', 'create', 'edit', 'approve', 'export'] },
      viewOnly('projects'),
      viewOnly('orders'),
      crudAccess('calendar'),
      crudAccess('tasks'),
      viewOnly('ai-assistant'),
    ],
  },
  {
    id: 'inventory',
    name: 'Inventario',
    description: 'Gestión de productos y stock',
    isSystem: true,
    permissions: [
      viewOnly('dashboard'),
      viewOnly('clients'),
      viewOnly('sales'),
      { module: 'inventory', actions: ['view', 'create', 'edit', 'export', 'import'] },
      viewOnly('finance'),
      viewOnly('hr'),
      viewOnly('projects'),
      { module: 'orders', actions: ['view', 'edit'] },
      crudAccess('calendar'),
      crudAccess('tasks'),
      viewOnly('ai-assistant'),
    ],
  },
  {
    id: 'operations',
    name: 'Operaciones',
    description: 'Gestión de proyectos y órdenes de trabajo',
    isSystem: true,
    permissions: [
      viewOnly('dashboard'),
      viewOnly('clients'),
      viewOnly('sales'),
      viewOnly('inventory'),
      viewOnly('finance'),
      viewOnly('hr'),
      { module: 'projects', actions: ['view', 'create', 'edit', 'export'] },
      { module: 'orders', actions: ['view', 'create', 'edit', 'export'] },
      crudAccess('calendar'),
      crudAccess('tasks'),
      viewOnly('workflows'),
      viewOnly('ai-assistant'),
    ],
  },
  {
    id: 'viewer',
    name: 'Solo Lectura',
    description: 'Acceso de solo lectura a módulos básicos',
    isSystem: true,
    permissions: [
      viewOnly('dashboard'),
      viewOnly('clients'),
      viewOnly('sales'),
      viewOnly('inventory'),
      viewOnly('projects'),
      viewOnly('orders'),
      viewOnly('calendar'),
      viewOnly('tasks'),
    ],
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Rol con permisos personalizados',
    isSystem: false,
    permissions: [],
  },
];

/**
 * Get role definition by ID
 */
export function getRoleById(roleId: string): RoleDefinition | undefined {
  return SYSTEM_ROLES.find(role => role.id === roleId);
}

/**
 * Get all available system roles
 */
export function getSystemRoles(): RoleDefinition[] {
  return SYSTEM_ROLES.filter(role => role.isSystem);
}
