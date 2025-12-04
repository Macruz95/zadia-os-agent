/**
 * ZADIA OS - Branding Provider
 * Applies white label branding dynamically
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WhiteLabelService, BrandingConfig, DEFAULT_BRANDING } from '@/services/white-label.service';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  updateBranding: (updates: Partial<BrandingConfig>) => Promise<void>;
  resetToDefault: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
  tenantId?: string;
}

export function BrandingProvider({ children, tenantId }: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load branding on mount or tenant change
  useEffect(() => {
    async function loadBranding() {
      if (tenantId) {
        try {
          const config = await WhiteLabelService.getBranding(tenantId);
          setBranding(config);
        } catch (error) {
          logger.error('Failed to load branding', error as Error);
          setBranding(DEFAULT_BRANDING);
        }
      } else {
        setBranding(DEFAULT_BRANDING);
      }
      setLoading(false);
    }

    loadBranding();
  }, [tenantId]);

  // Apply CSS variables when branding changes
  useEffect(() => {
    const cssVars = WhiteLabelService.generateCSSVariables(branding);
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Update favicon if custom
    if (branding.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon;
      }
    }

    // Update document title if custom company name
    if (branding.companyName && branding.companyName !== 'ZADIA OS') {
      document.title = `${branding.companyName} - Dashboard`;
    }
  }, [branding]);

  const updateBranding = async (updates: Partial<BrandingConfig>) => {
    if (!tenantId || !user) return;
    
    try {
      await WhiteLabelService.updateBranding(tenantId, updates, user.uid);
      setBranding(prev => ({ ...prev, ...updates }));
    } catch (error) {
      logger.error('Failed to update branding', error as Error);
      throw error;
    }
  };

  const resetToDefault = () => {
    setBranding(DEFAULT_BRANDING);
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, updateBranding, resetToDefault }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

export default BrandingProvider;
