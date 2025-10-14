/**
 * ZADIA OS - Lead Conversion Hook
 * 
 * Manages lead conversion wizard state and flow
 * Following ZADIA Rule 4: Modular architecture
 * Following ZADIA Rule 5: Max 200 lines
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lead } from '../types/sales.types';
import {
  LeadConversionInput,
  ConversionResult,
  ConversionDecision,
  ClientFromLeadInput,
  OpportunityFromConversionInput,
} from '../validations/lead-conversion.schema';
import { LeadConversionService } from '../services/lead-conversion.service';
import { useAuthState } from '@/hooks/use-auth-state';
import { logger } from '@/lib/logger';

export type ConversionStep = 'duplicate-check' | 'client-creation' | 'opportunity-creation' | 'summary';

interface UseLeadConversionReturn {
  // State
  currentStep: ConversionStep;
  isConverting: boolean;
  error: string | null;
  conversionResult: ConversionResult | null;
  
  // Step data
  conversionDecision: ConversionDecision | null;
  clientData: ClientFromLeadInput | null;
  opportunityData: OpportunityFromConversionInput | null;
  
  // Actions
  setConversionDecision: (decision: ConversionDecision) => void;
  setClientData: (data: ClientFromLeadInput) => void;
  setOpportunityData: (data: OpportunityFromConversionInput) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: ConversionStep) => void;
  executeConversion: (lead: Lead) => Promise<void>;
  reset: () => void;
}

const STEP_ORDER: ConversionStep[] = [
  'duplicate-check',
  'client-creation',
  'opportunity-creation',
  'summary',
];

export function useLeadConversion(): UseLeadConversionReturn {
  const router = useRouter();
  const { user } = useAuthState();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<ConversionStep>('duplicate-check');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  
  // Form data
  const [conversionDecision, setConversionDecision] = useState<ConversionDecision | null>(null);
  const [clientData, setClientData] = useState<ClientFromLeadInput | null>(null);
  const [opportunityData, setOpportunityData] = useState<OpportunityFromConversionInput | null>(null);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep]);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * Jump to specific step
   */
  const goToStep = useCallback((step: ConversionStep) => {
    setCurrentStep(step);
  }, []);

  /**
   * Execute the complete conversion
   */
  const executeConversion = useCallback(async (lead: Lead) => {
    if (!user?.uid) {
      setError('Usuario no autenticado');
      return;
    }

    if (!conversionDecision) {
      setError('Decisión de conversión requerida');
      return;
    }

    if (!opportunityData) {
      setError('Datos de oportunidad requeridos');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const input: LeadConversionInput = {
        leadId: lead.id,
        conversionDecision,
        clientData: conversionDecision.action === 'create-new' ? clientData! : undefined,
        opportunityData,
        transferHistory: true,
        notifyTeam: true,
      };

      const result = await LeadConversionService.convertLead(input, user.uid);
      
      setConversionResult(result);
      setCurrentStep('summary');

      logger.info('Conversion completed successfully');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/sales/opportunities/${result.opportunityId}`);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al convertir lead';
      setError(errorMessage);
      logger.error('Conversion failed', err as Error);
    } finally {
      setIsConverting(false);
    }
  }, [user, conversionDecision, clientData, opportunityData, router]);

  /**
   * Reset wizard to initial state
   */
  const reset = useCallback(() => {
    setCurrentStep('duplicate-check');
    setIsConverting(false);
    setError(null);
    setConversionResult(null);
    setConversionDecision(null);
    setClientData(null);
    setOpportunityData(null);
  }, []);

  return {
    // State
    currentStep,
    isConverting,
    error,
    conversionResult,
    
    // Step data
    conversionDecision,
    clientData,
    opportunityData,
    
    // Actions
    setConversionDecision,
    setClientData,
    setOpportunityData,
    nextStep,
    previousStep,
    goToStep,
    executeConversion,
    reset,
  };
}
