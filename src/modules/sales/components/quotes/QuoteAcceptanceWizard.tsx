/**
 * ZADIA OS - Quote Acceptance Wizard
 * 
 * Main wizard dialog for Quote → Project conversion
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, FileText, Settings, Package, Wrench, Rocket } from 'lucide-react';
import { Quote } from '../../types/sales.types';
import { useQuoteAcceptance } from '../../hooks/use-quote-acceptance';
import { QuoteReviewStep } from './QuoteReviewStep';
import { ProjectConfigStep } from './ProjectConfigStep';
import { InventoryReservationStep } from './InventoryReservationStep';
import { WorkOrdersStep } from './WorkOrdersStep';
import { ProjectConversionSummary } from './ProjectConversionSummary';

interface QuoteAcceptanceWizardProps {
  quote: Quote;
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 0, label: 'Revisar', icon: FileText },
  { id: 1, label: 'Proyecto', icon: Settings },
  { id: 2, label: 'Inventario', icon: Package },
  { id: 3, label: 'Órdenes', icon: Wrench },
  { id: 4, label: 'Confirmar', icon: Rocket },
];

export function QuoteAcceptanceWizard({ quote, open, onClose }: QuoteAcceptanceWizardProps) {
  const {
    currentStep,
    isConverting,
    conversionResult,
    acceptanceData,
    projectConfig,
    inventoryReservations,
    workOrders,
    setAcceptanceData,
    setProjectConfig,
    setInventoryReservations,
    setWorkOrders,
    nextStep,
    previousStep,
    executeConversion,
    reset,
  } = useQuoteAcceptance();

  const handleClose = () => {
    reset();
    onClose();
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {conversionResult ? '¡Proyecto Creado!' : 'Convertir Cotización a Proyecto'}
          </DialogTitle>
        </DialogHeader>

        {!conversionResult && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${
                        isActive ? 'text-primary font-semibold' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="py-6">
              {currentStep === 0 && (
                <QuoteReviewStep
                  quote={quote}
                  onNext={nextStep}
                  onAcceptanceData={setAcceptanceData}
                />
              )}

              {currentStep === 1 && (
                <ProjectConfigStep
                  quote={quote}
                  onNext={nextStep}
                  onBack={previousStep}
                  onProjectConfig={setProjectConfig}
                />
              )}

              {currentStep === 2 && (
                <InventoryReservationStep
                  quote={quote}
                  onNext={nextStep}
                  onBack={previousStep}
                  onReservations={setInventoryReservations}
                />
              )}

              {currentStep === 3 && (
                <WorkOrdersStep
                  quote={quote}
                  onNext={nextStep}
                  onBack={previousStep}
                  onWorkOrders={setWorkOrders}
                />
              )}

              {currentStep === 4 && (
                <ProjectConversionSummary
                  quote={quote}
                  acceptanceData={acceptanceData}
                  projectConfig={projectConfig}
                  inventoryReservations={inventoryReservations}
                  workOrders={workOrders}
                  isConverting={isConverting}
                  onBack={previousStep}
                  onConfirm={() => executeConversion(quote)}
                />
              )}
            </div>
          </>
        )}

        {/* Success State */}
        {conversionResult && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">¡Proyecto Creado Exitosamente!</h3>
              <p className="text-muted-foreground mt-2">
                Proyecto #{conversionResult.projectId}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cotización:</span>
                <span className="font-semibold">{quote.number}</span>
              </div>
              <div className="flex justify-between">
                <span>Reservaciones creadas:</span>
                <span className="font-semibold">{conversionResult.reservationsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span>Órdenes de trabajo:</span>
                <span className="font-semibold">{conversionResult.workOrdersCreated}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirigiendo al proyecto...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
