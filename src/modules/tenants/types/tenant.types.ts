import { Timestamp } from 'firebase/firestore';

/**
 * ZADIA OS - Multi-Tenant Types
 * Defines the core types for multi-tenancy support
 */

// ============================================
// Subscription Plans
// ============================================
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxUsers: number;
  maxStorage: number; // in GB
  maxProjects: number;
  maxClients: number;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxUsers: 3,
    maxStorage: 1,
    maxProjects: 10,
    maxClients: 50,
    features: ['basic_crm', 'basic_inventory', 'basic_reports'],
  },
  pro: {
    maxUsers: 15,
    maxStorage: 10,
    maxProjects: 100,
    maxClients: 500,
    features: ['full_crm', 'full_inventory', 'advanced_reports', 'ai_assistant', 'integrations'],
  },
  enterprise: {
    maxUsers: -1, // unlimited
    maxStorage: 100,
    maxProjects: -1,
    maxClients: -1,
    features: ['all', 'custom_branding', 'api_access', 'priority_support', 'sla'],
  },
};

// ============================================
// Tenant Settings
// ============================================
export interface TenantSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  language: 'es' | 'en';
  locale?: string; // Full locale like 'es-MX'
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  features: {
    multiUser: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  currency: 'USD',
  timezone: 'America/Mexico_City',
  dateFormat: 'DD/MM/YYYY',
  language: 'es',
  locale: 'es-MX',
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
};

// ============================================
// Tenant Entity
// ============================================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: SubscriptionPlan;
  settings: TenantSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  // Usage tracking
  usage: {
    users: number;
    storage: number;
    projects: number;
    clients: number;
  };
  // Billing info (optional)
  billing?: {
    customerId?: string;
    subscriptionId?: string;
    nextBillingDate?: Timestamp;
  };
}

// ============================================
// Tenant Member Roles
// ============================================
export type TenantRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  displayName: string;
  role: TenantRole;
  permissions: string[]; // Custom permissions override
  joinedAt: Timestamp;
  invitedBy: string;
  isActive: boolean;
  lastAccess?: Timestamp;
}

// ============================================
// Tenant Invitation
// ============================================
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  invitedBy: string;
  invitedByName: string;
  status: InvitationStatus;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
}

// ============================================
// Form Data Types
// ============================================
export interface CreateTenantData {
  name: string;
  slug?: string;
  plan?: SubscriptionPlan;
  settings?: Partial<TenantSettings>;
}

export interface UpdateTenantData {
  name?: string;
  settings?: Partial<TenantSettings>;
}

export interface InviteMemberData {
  email: string;
  role: TenantRole;
  permissions?: string[];
}
