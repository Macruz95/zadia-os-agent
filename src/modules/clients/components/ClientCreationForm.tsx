'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ClientFormData, ClientFormSchema } from '../validations/clients.schema';
import { ClientTypeStep } from './form-steps/ClientTypeStep';
import { BasicInfoStep } from './form-steps/BasicInfoStep';
import { AddressStep } from './form-steps/AddressStep';
import { ContactStep } from './form-steps/ContactStep';
import { ReviewStep } from './form-steps/ReviewStep';
import { StepLayout } from './form-steps/StepLayout';
import { PhoneCodeInput } from './reusable-components';
import { createClientWithContacts } from '../services/clients.service';
import { notificationService } from '@/lib/notifications';
import { getStepTitles as getFormStepTitles } from '../utils/form-steps.utils';

interface ClientCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TOTAL_STEPS = 5;

// Función para obtener títulos dinámicos según el tipo de cliente
const getStepTitles = (clientType: string) => {
  return getFormStepTitles(clientType as 'PersonaNatural' | 'Empresa');
};

export function ClientCreationForm({ onSuccess }: ClientCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: {
      name: '',
      documentId: '',
      clientType: 'PersonaNatural',
      status: 'Potencial',
      tags: [],
      communicationOptIn: false,
      address: {
        country: '',
        state: '',
        city: '',
        street: '',
        postalCode: '',
      },
      contacts: [{
        name: '',
        role: '',
        email: '',
        phone: '',
        phoneCountryId: '',
        isPrimary: true,
      }],
    },
  });

  const clientType = form.watch('clientType');
  const clientName = form.watch('name');

  // Auto-llenar contacto principal cuando es Persona Natural
  useEffect(() => {
    if (clientType === 'PersonaNatural' && clientName) {
      form.setValue('contacts.0.name', clientName);
      form.setValue('contacts.0.role', 'Cliente Principal');
    }
  }, [clientType, clientName, form]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      
      // Create client with contacts using new function
      await createClientWithContacts(formData);
      
      notificationService.success('Cliente y contactos creados exitosamente');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el cliente';
      notificationService.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Para Persona Natural en paso 4, validar teléfono antes de pasar
    if (currentStep === 4 && clientType === 'PersonaNatural') {
      const isValid = await form.trigger(['contacts.0.phone' as keyof ClientFormData]);
      if (isValid) {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      }
      return;
    }

    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as (keyof ClientFormData)[]);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['clientType'];
      case 2:
        return ['name', 'documentId', 'status'];
      case 3:
        return ['address.country', 'address.state', 'address.city'];
      case 4:
        // Para Persona Natural, solo requerir teléfono (email es opcional)
        return clientType === 'PersonaNatural' ? ['contacts.0.phone'] : ['contacts.0.name', 'contacts.0.email'];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ClientTypeStep form={form} />;
      case 2:
        return <BasicInfoStep form={form} clientType={clientType} />;
      case 3:
        return <AddressStep form={form} />;
      case 4:
        // Para Persona Natural, mostrar información del contacto auto-generado
        if (clientType === 'PersonaNatural') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Contacto Principal</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Para personas naturales, el contacto principal es automáticamente la misma persona registrada.
                  Solo necesitas proporcionar el número de teléfono. El código postal es opcional.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900">{clientName || 'Pendiente'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rol</label>
                    <p className="text-sm text-gray-900">Cliente Principal</p>
                  </div>
                </div>
              </div>
              
              {/* Campos editables para teléfono y email */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contacts.0.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="email@ejemplo.com" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="contacts.0.phone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de teléfono (Requerido)</FormLabel>
                      <PhoneCodeInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        countryId={form.watch('contacts.0.phoneCountryId')}
                        onCountryChange={(countryId) => {
                          form.setValue('contacts.0.phoneCountryId', countryId);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        }
        // Para empresas/organizaciones, mostrar el formulario completo
        return <ContactStep form={form} contactIndex={0} />;
      case 5:
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

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
        {renderStepContent()}
      </StepLayout>
    </Form>
  );
}