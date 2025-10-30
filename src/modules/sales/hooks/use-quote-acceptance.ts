/**
 * ZADIA OS - Use Quote Acceptance Hook
 * 
 * Manages Quote → Project conversion wizard state
 * Following ZADIA Rule 4: Modular architecture
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { convertQuoteToProject } from '../services/quote-project-conversion.service';
import {
  QuoteProjectConversionInput,
  QuoteAcceptanceInput,
  ProjectConfigInput,
  InventoryReservationInput,
  WorkOrderInput,
  ConversionResult,
} from '../validations/quote-project-conversion.schema';
import { Quote } from '../types/sales.types';

interface UseQuoteAcceptanceReturn {
  // State
  currentStep: number;
  isConverting: boolean;
  error: string | null;
  conversionResult: ConversionResult | null;
  
  // Data
  acceptanceData: QuoteAcceptanceInput | null;
  projectConfig: ProjectConfigInput | null;
  inventoryReservations: InventoryReservationInput[];
  workOrders: WorkOrderInput[];
  
  // Actions
  setAcceptanceData: (data: QuoteAcceptanceInput) => void;
  setProjectConfig: (data: ProjectConfigInput) => void;
  setInventoryReservations: (data: InventoryReservationInput[]) => void;
  setWorkOrders: (data: WorkOrderInput[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  executeConversion: (quote: Quote) => Promise<void>;
  reset: () => void;
}

const TOTAL_STEPS = 5; // Review → Project → Inventory → Work Orders → Confirmation

export function useQuoteAcceptance(): UseQuoteAcceptanceReturn {
  const router = useRouter();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  
  // Conversion data
  const [acceptanceData, setAcceptanceData] = useState<QuoteAcceptanceInput | null>(null);
  const [projectConfig, setProjectConfig] = useState<ProjectConfigInput | null>(null);
  const [inventoryReservations, setInventoryReservations] = useState<InventoryReservationInput[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderInput[]>([]);
  
  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);
  
  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  /**
   * Jump to specific step
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);
  
  /**
   * Execute the conversion
   */
  const executeConversion = useCallback(async (quote: Quote) => {
    if (!acceptanceData || !projectConfig) {
      setError('Datos incompletos para la conversión');
      return;
    }
    
    try {
      setIsConverting(true);
      setError(null);
      
      const conversionData: QuoteProjectConversionInput = {
        quoteId: quote.id,
        acceptance: acceptanceData,
        projectConfig,
        inventoryReservations,
        workOrders,
        notifyTeam: true,
        notifyClient: true,
      };
      
      const result = await convertQuoteToProject(conversionData);
      
      setConversionResult(result);
      toast.success('¡Proyecto creado exitosamente!');
      
      // Redirect to project page after short delay
      setTimeout(() => {
        router.push(`/projects/${result.projectId}`);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al convertir cotización';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Error in quote conversion', err as Error, {
        component: 'useQuoteAcceptance',
        action: 'executeConversion',
        metadata: { quoteId: quote.id }
      });
    } finally {
      setIsConverting(false);
    }
  }, [acceptanceData, projectConfig, inventoryReservations, workOrders, router]);
  
  /**
   * Reset wizard state
   */
  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsConverting(false);
    setError(null);
    setConversionResult(null);
    setAcceptanceData(null);
    setProjectConfig(null);
    setInventoryReservations([]);
    setWorkOrders([]);
  }, []);
  
  return {
    // State
    currentStep,
    isConverting,
    error,
    conversionResult,
    
    // Data
    acceptanceData,
    projectConfig,
    inventoryReservations,
    workOrders,
    
    // Actions
    setAcceptanceData,
    setProjectConfig,
    setInventoryReservations,
    setWorkOrders,
    nextStep,
    previousStep,
    goToStep,
    executeConversion,
    reset,
  };
}
