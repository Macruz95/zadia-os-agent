/**
 * ZADIA OS - White Label Service
 * Customization per tenant: colors, logo, domain, branding
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface BrandingConfig {
  // Basic Branding
  companyName: string;
  tagline?: string;
  logo?: string;
  logoLight?: string; // For dark backgrounds
  logoDark?: string;  // For light backgrounds
  favicon?: string;
  
  // Colors
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  
  // Typography
  fonts?: {
    heading?: string;
    body?: string;
    mono?: string;
  };
  
  // Custom Domain
  domain?: {
    custom?: string;
    subdomain?: string;
    verified?: boolean;
    sslEnabled?: boolean;
  };
  
  // Email Branding
  emailBranding?: {
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    headerImage?: string;
    footerText?: string;
    socialLinks?: {
      website?: string;
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  
  // Login Page Customization
  loginPage?: {
    backgroundImage?: string;
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    showPoweredBy?: boolean;
  };
  
  // Features Toggle
  features?: {
    hideZadiaLogo?: boolean;
    customLoginPage?: boolean;
    customEmailTemplates?: boolean;
    customDomain?: boolean;
  };
  
  // Metadata
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Default ZADIA OS branding
export const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'ZADIA OS',
  tagline: 'Sistema Operativo Empresarial Agéntico',
  colors: {
    primary: '#06b6d4',      // cyan-500
    primaryHover: '#0891b2', // cyan-600
    secondary: '#8b5cf6',    // violet-500
    accent: '#f59e0b',       // amber-500
    background: '#0d1117',
    backgroundSecondary: '#161b22',
    text: '#ffffff',
    textMuted: '#9ca3af',    // gray-400
    border: '#374151',       // gray-700
    success: '#22c55e',      // green-500
    warning: '#f59e0b',      // amber-500
    error: '#ef4444'         // red-500
  },
  loginPage: {
    showPoweredBy: true
  },
  features: {
    hideZadiaLogo: false,
    customLoginPage: false,
    customEmailTemplates: false,
    customDomain: false
  }
};

// ============================================
// Service
// ============================================

export class WhiteLabelService {
  private static readonly COLLECTION = 'tenant-branding';
  private static cache = new Map<string, BrandingConfig>();

  /**
   * Get branding config for a tenant
   */
  static async getBranding(tenantId: string): Promise<BrandingConfig> {
    try {
      // Check cache first
      if (this.cache.has(tenantId)) {
        return this.cache.get(tenantId)!;
      }

      const docRef = doc(db, this.COLLECTION, tenantId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return DEFAULT_BRANDING;
      }

      const branding = {
        ...DEFAULT_BRANDING,
        ...docSnap.data()
      } as BrandingConfig;

      // Cache for 5 minutes
      this.cache.set(tenantId, branding);
      setTimeout(() => this.cache.delete(tenantId), 5 * 60 * 1000);

      return branding;
    } catch (error) {
      logger.error('Failed to get branding', error as Error);
      return DEFAULT_BRANDING;
    }
  }

  /**
   * Save branding config for a tenant
   */
  static async saveBranding(
    tenantId: string, 
    branding: Partial<BrandingConfig>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, tenantId);
      const updateData = {
        ...branding,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };

      await setDoc(docRef, updateData, { merge: true });
      
      // Invalidate cache
      this.cache.delete(tenantId);
      
      logger.info('Branding saved', {
        component: 'WhiteLabelService',
        metadata: { tenantId }
      });
    } catch (error) {
      logger.error('Failed to save branding', error as Error);
      throw error;
    }
  }

  /**
   * Update specific branding fields
   */
  static async updateBranding(
    tenantId: string,
    updates: Partial<BrandingConfig>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, tenantId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });
      
      // Invalidate cache
      this.cache.delete(tenantId);
      
      logger.info('Branding updated', {
        component: 'WhiteLabelService',
        metadata: { tenantId }
      });
    } catch (error) {
      logger.error('Failed to update branding', error as Error);
      throw error;
    }
  }

  /**
   * Generate CSS variables from branding config
   */
  static generateCSSVariables(branding: BrandingConfig): Record<string, string> {
    return {
      '--brand-primary': branding.colors.primary,
      '--brand-primary-hover': branding.colors.primaryHover,
      '--brand-secondary': branding.colors.secondary,
      '--brand-accent': branding.colors.accent,
      '--brand-background': branding.colors.background,
      '--brand-background-secondary': branding.colors.backgroundSecondary,
      '--brand-text': branding.colors.text,
      '--brand-text-muted': branding.colors.textMuted,
      '--brand-border': branding.colors.border,
      '--brand-success': branding.colors.success,
      '--brand-warning': branding.colors.warning,
      '--brand-error': branding.colors.error,
      '--font-heading': branding.fonts?.heading || 'Inter, sans-serif',
      '--font-body': branding.fonts?.body || 'Inter, sans-serif',
      '--font-mono': branding.fonts?.mono || 'JetBrains Mono, monospace'
    };
  }

  /**
   * Verify custom domain ownership
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async verifyDomain(tenantId: string, _domain: string): Promise<{
    verified: boolean;
    txtRecord?: string;
    cnameRecord?: string;
  }> {
    // Generate verification records
    const verificationToken = `zadia-verify=${tenantId.substring(0, 12)}`;
    
    // In production, you would:
    // 1. Generate unique verification token
    // 2. Check DNS TXT record for the token
    // 3. Check CNAME record pointing to your app
    
    return {
      verified: false,
      txtRecord: verificationToken,
      cnameRecord: 'app.zadia.io'
    };
  }

  /**
   * Get predefined color themes
   */
  static getColorThemes(): Array<{
    id: string;
    name: string;
    colors: BrandingConfig['colors'];
  }> {
    return [
      {
        id: 'zadia-dark',
        name: 'ZADIA Oscuro',
        colors: DEFAULT_BRANDING.colors
      },
      {
        id: 'corporate-blue',
        name: 'Corporativo Azul',
        colors: {
          primary: '#3b82f6',
          primaryHover: '#2563eb',
          secondary: '#6366f1',
          accent: '#f59e0b',
          background: '#1e293b',
          backgroundSecondary: '#334155',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          border: '#475569',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      {
        id: 'modern-green',
        name: 'Verde Moderno',
        colors: {
          primary: '#10b981',
          primaryHover: '#059669',
          secondary: '#06b6d4',
          accent: '#f59e0b',
          background: '#0f172a',
          backgroundSecondary: '#1e293b',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          border: '#334155',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      {
        id: 'elegant-purple',
        name: 'Púrpura Elegante',
        colors: {
          primary: '#8b5cf6',
          primaryHover: '#7c3aed',
          secondary: '#ec4899',
          accent: '#f59e0b',
          background: '#18181b',
          backgroundSecondary: '#27272a',
          text: '#fafafa',
          textMuted: '#a1a1aa',
          border: '#3f3f46',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      {
        id: 'light-professional',
        name: 'Claro Profesional',
        colors: {
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          secondary: '#7c3aed',
          accent: '#f59e0b',
          background: '#ffffff',
          backgroundSecondary: '#f3f4f6',
          text: '#111827',
          textMuted: '#6b7280',
          border: '#e5e7eb',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      }
    ];
  }
}

export default WhiteLabelService;
