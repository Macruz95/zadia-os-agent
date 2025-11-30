/**
 * ZADIA OS - Permission Types
 * Defines the core types for RBAC (Role-Based Access Control)
 */

// ============================================
// Module Definitions
// ============================================
export type Module = 
  | 'dashboard'
  | 'clients'
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'projects'
  | 'orders'
  | 'calendar'
  | 'tasks'
  | 'workflows'
  | 'ai-assistant'
  | 'settings'
  | 'admin';

export const ALL_MODULES: Module[] = [
  'dashboard',
  'clients',
  'sales',
  'inventory',
  'finance',
  'hr',
  'projects',
  'orders',
  'calendar',
  'tasks',
  'workflows',
  'ai-assistant',
  'settings',
  'admin',
];

// ============================================
// Action Definitions
// ============================================
export type Action = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'import'
  | 'manage';

export const ALL_ACTIONS: Action[] = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'export',
  'import',
  'manage',
];

// ============================================
// Permission Structure
// ============================================
export interface Permission {
  module: Module;
  actions: Action[];
}

export interface PermissionSet {
  permissions: Permission[];
  customRules?: CustomRule[];
}

// ============================================
// Custom Rules (Field-level, Record-level)
// ============================================
export interface CustomRule {
  type: 'field' | 'record' | 'condition';
  module: Module;
  rule: string; // e.g., "hide:salary", "own-records-only"
  description?: string;
}

// ============================================
// Role Definitions
// ============================================
export type SystemRole = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'accountant'
  | 'sales'
  | 'hr'
  | 'inventory'
  | 'operations'
  | 'viewer'
  | 'custom';

export interface RoleDefinition {
  id: SystemRole;
  name: string;
  description: string;
  permissions: Permission[];
  customRules?: CustomRule[];
  isSystem: boolean; // System roles cannot be deleted
}

// ============================================
// Module Display Info
// ============================================
export interface ModuleInfo {
  id: Module;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  availableActions: Action[];
}

export const MODULE_INFO: Record<Module, ModuleInfo> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Vista general y KPIs',
    icon: 'LayoutDashboard',
    availableActions: ['view', 'export'],
  },
  clients: {
    id: 'clients',
    name: 'Clientes',
    description: 'Gestión de clientes',
    icon: 'Users',
    availableActions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  sales: {
    id: 'sales',
    name: 'Ventas',
    description: 'Leads, oportunidades y cotizaciones',
    icon: 'TrendingUp',
    availableActions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  inventory: {
    id: 'inventory',
    name: 'Inventario',
    description: 'Productos, stock y movimientos',
    icon: 'Package',
    availableActions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  finance: {
    id: 'finance',
    name: 'Finanzas',
    description: 'Facturas, pagos y reportes',
    icon: 'DollarSign',
    availableActions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  hr: {
    id: 'hr',
    name: 'Recursos Humanos',
    description: 'Empleados, nómina y beneficios',
    icon: 'UserCog',
    availableActions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  projects: {
    id: 'projects',
    name: 'Proyectos',
    description: 'Gestión de proyectos y tareas',
    icon: 'FolderKanban',
    availableActions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  orders: {
    id: 'orders',
    name: 'Órdenes',
    description: 'Órdenes de compra y venta',
    icon: 'ShoppingCart',
    availableActions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  calendar: {
    id: 'calendar',
    name: 'Calendario',
    description: 'Eventos y recordatorios',
    icon: 'Calendar',
    availableActions: ['view', 'create', 'edit', 'delete'],
  },
  tasks: {
    id: 'tasks',
    name: 'Tareas',
    description: 'Gestión de tareas',
    icon: 'CheckSquare',
    availableActions: ['view', 'create', 'edit', 'delete'],
  },
  workflows: {
    id: 'workflows',
    name: 'Workflows',
    description: 'Automatizaciones',
    icon: 'Workflow',
    availableActions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  'ai-assistant': {
    id: 'ai-assistant',
    name: 'Asistente IA',
    description: 'Asistente inteligente',
    icon: 'Bot',
    availableActions: ['view'],
  },
  settings: {
    id: 'settings',
    name: 'Configuración',
    description: 'Configuración del sistema',
    icon: 'Settings',
    availableActions: ['view', 'edit', 'manage'],
  },
  admin: {
    id: 'admin',
    name: 'Administración',
    description: 'Gestión de usuarios y roles',
    icon: 'Shield',
    availableActions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
};
