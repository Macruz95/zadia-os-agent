'use client';

import { Form } from '@/components/ui/form';
import { StepLayout } from './form-steps/StepLayout';
import { useClientForm } from './useClientForm';
import { useClientFormNavigation } from './ClientFormNavigation';
import { ClientFormStepContent } from './ClientFormStepContent';
import { TOTAL_STEPS } from './ClientFormConstants';
import { getStepTitles as getFormStepTitles } from '../utils/form-steps.utils';

interface ClientCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Función para obtener títulos dinámicos según el tipo de cliente
const getStepTitles = (clientType: string) => {
  return getFormStepTitles(clientType as 'PersonaNatural' | 'Empresa');
};

export function ClientCreationForm({ onSuccess }: ClientCreationFormProps) {
  const { 
    form, 
    currentStep, 
    setCurrentStep, 
    isSubmitting, 
    clientType, 
    clientName, 
    handleSubmit 
  } = useClientForm({ onSuccess });

  const { nextStep, prevStep } = useClientFormNavigation({
    form,
    currentStep,
    setCurrentStep,
    clientType
  });

  return (
    <Form {...form}>
      <StepLayout
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrevious={prevStep}
        onNext={nextStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === TOTAL_STEPS}
        stepTitles={getStepTitles(clientType)}
      >
        <ClientFormStepContent
          form={form}
          currentStep={currentStep}
          clientType={clientType}
          clientName={clientName}
        />
      </StepLayout>
    </Form>
  );
}