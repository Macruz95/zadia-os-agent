import { UseFormReturn } from 'react-hook-form';
import { ClientFormData } from '../validations/clients.schema';
import { getFieldsForStep, TOTAL_STEPS } from './ClientFormConstants';

interface ClientFormNavigationProps {
  form: UseFormReturn<ClientFormData>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  clientType: string;
}

export function useClientFormNavigation({ 
  form, 
  currentStep, 
  setCurrentStep, 
  clientType 
}: ClientFormNavigationProps) {
  const nextStep = async () => {
    // Para Persona Natural en paso 4, validar teléfono antes de pasar
    if (currentStep === 4 && clientType === 'PersonaNatural') {
      const isValid = await form.trigger(['contacts.0.phone' as keyof ClientFormData]);
      if (isValid) {
        setCurrentStep(Math.min(currentStep + 1, TOTAL_STEPS));
      }
      return;
    }

    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep, clientType);
    const isValid = await form.trigger(fieldsToValidate as (keyof ClientFormData)[]);
    
    if (isValid) {
      setCurrentStep(Math.min(currentStep + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  return { nextStep, prevStep };
}