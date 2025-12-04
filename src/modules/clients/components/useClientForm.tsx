import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientFormData, ClientFormSchema } from '../validations/clients.schema';
import { ClientsService } from '../services/clients.service';
import { notificationService } from '@/lib/notifications';
import { getDefaultFormValues } from './ClientFormConstants';
import { useTenantId } from '@/contexts/TenantContext';

interface UseClientFormProps {
  onSuccess?: () => void;
}

export function useClientForm({ onSuccess }: UseClientFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantId = useTenantId();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: getDefaultFormValues(),
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
    if (!tenantId) {
      notificationService.error('No se ha seleccionado una empresa');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      
      // Create client with contacts using new function with tenantId
      await ClientsService.createClientWithContacts(formData, tenantId);
      
      notificationService.success('Cliente y contactos creados exitosamente');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el cliente';
      notificationService.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    clientType,
    clientName,
    handleSubmit
  };
}