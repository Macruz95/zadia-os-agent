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
import { ClientsService } from '@/modules/clients/services/clients.service'; // NEW
import { LeadsService } from '../services/leads.service'; // NEW
import { useAuth } from '@/contexts/AuthContext'; // NEW
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
  const { user } = useAuth(); // NEW

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
    if (!acceptanceData || !projectConfig || !user?.uid) {
      setError('Datos incompletos para la conversión');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);

      // NEW: Check if we need to create a client from lead first
      let finalClientId = quote.clientId;
      let finalContactId = quote.contactId;

      if (!finalClientId && quote.leadId) {
        try {
          // 1. Get Lead data
          const lead = await LeadsService.getLeadById(quote.leadId);
          if (!lead) throw new Error('Lead no encotrado');

          // 2. Create Client from Lead using createClientWithContacts (safer and validation-compliant)
          // Map Lead entityType to ClientTypeEnum
          const clientType = lead.entityType === 'person' ? 'PersonaNatural' : 'Empresa';

          const newClientId = await ClientsService.createClientWithContacts({
            name: lead.fullName || lead.entityName || 'Cliente sin nombre',
            clientType: clientType, // Fix: Use clientType instead of entityType
            documentId: `PENDING-${Date.now()}`, // Fix: Required field, using temporary ID
            communicationOptIn: true, // Default
            tags: ['convertido-desde-lead'],
            source: 'lead_conversion',
            gender: 'Otro', // Default for now
            status: 'Activo',
            // Remove type: 'customer' as it's not in ClientFormData
            address: {
              street: 'Dirección pendiente', // Required
              city: 'San José', // Required
              state: 'San José', // Required
              country: 'Costa Rica',
            },
            // Create a primary contact if phone/email exists
            contacts: lead.phone || lead.email ? [{
              name: lead.fullName || lead.entityName || 'Contacto Principal',
              email: lead.email || '',
              phone: lead.phone || '',
              phoneCountryId: lead.phoneCountryId || 'CR',
              role: 'Principal',
              isPrimary: true
            }] : []
          }, quote.tenantId || 'default');

          if (!newClientId) throw new Error('Error creating client');

          finalClientId = newClientId;
          // We don't get contacts back immediately, but that's fine for project creation
          // as we mainly need the clientId
          finalContactId = '';

          // 3. Update Lead status manually because convertLead uses fake IDs
          await LeadsService.updateLead(quote.leadId, {
            status: 'converted',
            convertedToClientId: finalClientId,
            // We don't have an opportunity ID yet as it's being created now as a project
            // But we can link it later or leave it as converted
          });

          logger.info('Auto-created client from lead during quote acceptance', {
            // Fix metadata type error by using generic object
            metadata: {
              leadId: quote.leadId,
              clientId: finalClientId
            }
          });
        } catch (err) {
          console.error('Error auto-creating client:', err);
          throw new Error('Error al crear cliente desde el Lead. Por favor convierta el lead manualmente primero.');
        }
      }

      // Ensure customerId is set (either from Quote or newly created)
      const validCustomerId = finalClientId || projectConfig.customerId;
      if (!validCustomerId) {
        throw new Error('No se pudo identificar un cliente para el proyecto');
      }

      const conversionData: QuoteProjectConversionInput = {
        quoteId: quote.id,
        acceptance: acceptanceData,
        projectConfig: {
          ...projectConfig,
          customerId: validCustomerId,
        },
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
