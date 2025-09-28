import { UseFormReturn, FieldValues } from 'react-hook-form';
import { ClientFormData } from '../validations/clients.schema';
import { ClientTypeStep } from './form-steps/ClientTypeStep';
import { BasicInfoStep } from './form-steps/BasicInfoStep';
import { AddressStep } from './form-steps/AddressStep';
import { ContactStep } from './form-steps/ContactStep';
import { ReviewStep } from './form-steps/ReviewStep';
import { NaturalPersonContact } from './NaturalPersonContact';

interface ClientFormStepContentProps {
  form: UseFormReturn<ClientFormData>;
  currentStep: number;
  clientType: string;
  clientName: string;
}

export function ClientFormStepContent({ 
  form, 
  currentStep, 
  clientType, 
  clientName 
}: ClientFormStepContentProps) {
  switch (currentStep) {
    case 1:
      return <ClientTypeStep form={form} />;
    case 2:
      return <BasicInfoStep form={form as unknown as UseFormReturn<FieldValues>} clientType={clientType} />;
    case 3:
      return <AddressStep form={form as unknown as UseFormReturn<FieldValues>} />;
    case 4:
      // Para Persona Natural, mostrar información del contacto auto-generado
      if (clientType === 'PersonaNatural') {
        return <NaturalPersonContact form={form} clientName={clientName} />;
      }
      // Para empresas/organizaciones, mostrar el formulario completo
      return <ContactStep form={form} contactIndex={0} />;
    case 5:
      return <ReviewStep form={form} />;
    default:
      return null;
  }
}