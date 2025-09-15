import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientFormData, ClientFormSchema } from '../validations/clients.schema';
import { createClient, updateClient } from '../services/clients.service';
import { createContact } from '../services/clients.service';
import { showToast } from '../../../lib/toast';

interface UseClientFormOptions {
  clientId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useClientForm = ({ clientId, onSuccess, onError }: UseClientFormOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: {
      name: '',
      documentId: '',
      clientType: 'PersonaNatural',
      birthDate: undefined,
      gender: undefined,
      status: 'Potencial',
      tags: [],
      source: '',
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
        isPrimary: true,
      }],
    },
  });

  const onSubmit = useCallback(async (data: ClientFormData) => {
    setIsSubmitting(true);

    try {
      let clientIdToUse = clientId;

      if (!clientId) {
        // Create new client
        clientIdToUse = await createClient({
          name: data.name,
          documentId: data.documentId,
          clientType: data.clientType,
          birthDate: data.birthDate,
          gender: data.gender,
          status: data.status,
          tags: data.tags,
          source: data.source,
          communicationOptIn: data.communicationOptIn,
          address: data.address,
        });
      } else {
        // Update existing client
        await updateClient(clientId, {
          name: data.name,
          documentId: data.documentId,
          clientType: data.clientType,
          birthDate: data.birthDate,
          gender: data.gender,
          status: data.status,
          tags: data.tags,
          source: data.source,
          communicationOptIn: data.communicationOptIn,
          address: data.address,
        });
      }

      // Create/update contacts
      for (const contact of data.contacts) {
        await createContact({
          clientId: clientIdToUse!,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
          isPrimary: contact.isPrimary,
        });
      }

      showToast.success(clientId ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      showToast.error(err.message);
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [clientId, onSuccess, onError]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  return {
    form,
    isSubmitting,
    onSubmit,
    resetForm,
  };
};