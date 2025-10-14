/**
 * ZADIA OS - Lead Conversion Wizard
 * 
 * Main wizard component for Lead → Client → Opportunity conversion
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons only
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Users, Briefcase, FileText } from 'lucide-react';
import { Lead } from '../../types/sales.types';
import { useLeadConversion } from '../../hooks/use-lead-conversion';
import { DuplicateCheckStep } from './DuplicateCheckStep';
import { ClientCreationStep } from './ClientCreationStep';
import { OpportunityCreationStep } from './OpportunityCreationStep';
import { ConversionSummary } from './ConversionSummary';

interface LeadConversionWizardProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { 
    id: 'duplicate-check', 
    label: 'Verificar Duplicados', 
    icon: CheckCircle2,
    description: 'Verificar clientes similares'
  },
  { 
    id: 'client-creation', 
    label: 'Crear Cliente', 
    icon: Users,
    description: 'Datos del cliente'
  },
  { 
    id: 'opportunity-creation', 
    label: 'Crear Oportunidad', 
    icon: Briefcase,
    description: 'Detalles de la oportunidad'
  },
  { 
    id: 'summary', 
    label: 'Resumen', 
    icon: FileText,
    description: 'Confirmación final'
  },
];

export function LeadConversionWizard({ lead, open, onClose }: LeadConversionWizardProps) {
  const conversion = useLeadConversion();
  
  const currentStepIndex = STEPS.findIndex(step => step.id === conversion.currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleClose = () => {
    conversion.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Convertir Lead a Cliente y Oportunidad
          </DialogTitle>
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-1 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive ? 'bg-primary/10' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-center">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step content */}
        <div className="mt-6">
          {conversion.currentStep === 'duplicate-check' && (
            <DuplicateCheckStep 
              lead={lead} 
              onNext={conversion.nextStep}
              onDecision={conversion.setConversionDecision}
            />
          )}
          
          {conversion.currentStep === 'client-creation' && (
            <ClientCreationStep
              lead={lead}
              decision={conversion.conversionDecision}
              onNext={conversion.nextStep}
              onBack={conversion.previousStep}
              onClientData={conversion.setClientData}
            />
          )}
          
          {conversion.currentStep === 'opportunity-creation' && (
            <OpportunityCreationStep
              lead={lead}
              clientData={conversion.clientData}
              onNext={conversion.nextStep}
              onBack={conversion.previousStep}
              onOpportunityData={conversion.setOpportunityData}
            />
          )}
          
          {conversion.currentStep === 'summary' && (
            <ConversionSummary
              lead={lead}
              conversionDecision={conversion.conversionDecision!}
              clientData={conversion.clientData}
              opportunityData={conversion.opportunityData!}
              isConverting={conversion.isConverting}
              error={conversion.error}
              result={conversion.conversionResult}
              onConfirm={() => conversion.executeConversion(lead)}
              onBack={conversion.previousStep}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
