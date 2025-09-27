'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Client } from '../types/clients.types';
import { updateClient } from '../services/clients.service';
import { notificationService } from '@/lib/notifications';
import { ClientFormSchema } from '../validations/clients.schema';
import { BasicInfoStep } from './form-steps/BasicInfoStep';
import { AddressStep } from './form-steps/AddressStep';
import { TagsManager } from './TagsManager';
import { ContactsManager } from './ContactsManager';
import { z } from 'zod';

// Esquema de edición que reutiliza ClientFormSchema pero sin contactos
const EditClientSchema = ClientFormSchema.omit({ contacts: true });

type EditClientFormData = z.infer<typeof EditClientSchema>;

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSuccess?: () => void;
}

export function EditClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: EditClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditClientFormData>({
    resolver: zodResolver(EditClientSchema),
    defaultValues: {
      name: client.name,
      documentId: client.documentId,
      clientType: client.clientType,
      status: client.status,
      birthDate: client.birthDate,
      gender: client.gender,
      tags: client.tags || [],
      source: client.source || '',
      communicationOptIn: client.communicationOptIn,
      address: {
        country: client.address.country,
        state: client.address.state,
        city: client.address.city,
        district: client.address.district || '',
        street: client.address.street,
        postalCode: client.address.postalCode || '',
      },
    },
  });

  const handleSubmit = async (data: EditClientFormData) => {
    try {
      setIsSubmitting(true);

      // Prepare update data, excluding undefined values
      const updateData: Partial<Client> = {
        name: data.name,
        documentId: data.documentId,
        clientType: data.clientType,
        status: data.status,
        gender: data.gender,
        tags: data.tags,
        communicationOptIn: data.communicationOptIn,
        address: {
          country: data.address.country,
          state: data.address.state,
          city: data.address.city,
          street: data.address.street,
          ...(data.address.district && data.address.district.trim() && { district: data.address.district.trim() }),
          ...(data.address.postalCode && data.address.postalCode.trim() && { postalCode: data.address.postalCode.trim() }),
        },
      };

      // Add optional fields only if they have values
      if (data.birthDate) {
        updateData.birthDate = data.birthDate;
      }

      if (data.source && data.source.trim()) {
        updateData.source = data.source.trim();
      }

      await updateClient(client.id, updateData);

      notificationService.success('Cliente actualizado exitosamente');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar cliente';
      notificationService.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] mx-4 overflow-y-auto">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            Editar Cliente
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicInfoStep form={form} clientType={form.watch('clientType')} />
            <AddressStep form={form} />
            
            {/* Información Adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Adicional</h3>
              
              <div>
                <Label htmlFor="source">Fuente de Referencia</Label>
                <Input
                  id="source"
                  {...form.register('source')}
                  placeholder="¿Cómo conoció nuestros servicios?"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="communicationOptIn"
                  checked={form.watch('communicationOptIn')}
                  onCheckedChange={(checked: boolean) => form.setValue('communicationOptIn', checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="communicationOptIn">
                  Acepta recibir comunicaciones promocionales
                </Label>
              </div>

              <TagsManager form={form} />
            </div>

            {/* Gestión de Contactos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de Contacto</h3>
              <ContactsManager clientId={client.id} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}