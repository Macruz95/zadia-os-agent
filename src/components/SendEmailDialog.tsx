'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Send, Loader2 } from 'lucide-react';
import { Contact } from '../modules/clients/types/clients.types';
import { EmailService } from '../lib/email.service';
import { notificationService } from '../lib/notifications';
import { ContactSelector } from './email/ContactSelector';
import { EmailFormFields } from './email/EmailFormFields';

const emailSchema = z.object({
  subject: z.string().min(1, 'El asunto es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  selectedContacts: z.array(z.string()).min(1, 'Selecciona al menos un contacto'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  clientName: string;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  contacts,
  clientName,
}: SendEmailDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: '',
      content: '',
      selectedContacts: [],
    },
  });

  const selectedContacts = form.watch('selectedContacts');
  const contactsWithEmail = contacts.filter(contact => contact.email && contact.email.trim() !== '');

  const handleSubmit = async (data: EmailFormData) => {
    if (contactsWithEmail.length === 0) {
      notificationService.error('No hay contactos con dirección de email válida');
      return;
    }

    setIsSending(true);
    try {
      const selectedContactsData = contactsWithEmail.filter(contact =>
        data.selectedContacts.includes(contact.id)
      );

      const results = await EmailService.sendBulkEmails(
        selectedContactsData.map(contact => ({
          email: contact.email!,
          name: contact.name || 'Cliente',
        })),
        data.subject,
        data.content,
        clientName
      );

      const successCount = results.filter((result: { success: boolean }) => result.success).length;
      const errorCount = results.length - successCount;

      if (successCount > 0) {
        notificationService.success(
          `Correo enviado exitosamente a ${successCount} contacto${successCount > 1 ? 's' : ''}`
        );
      }

      if (errorCount > 0) {
        notificationService.error(
          `Error al enviar ${errorCount} correo${errorCount > 1 ? 's' : ''}`
        );
      }

      if (successCount > 0) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al enviar correo';
      notificationService.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Enviar Correo Electrónico</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Contact Selection */}
              <ContactSelector
                contacts={contacts}
                selectedContacts={selectedContacts}
                onSelectionChange={(contactIds) => form.setValue('selectedContacts', contactIds)}
              />

              {/* Email Form Fields */}
              <EmailFormFields
                control={form.control}
                clientName={clientName}
              />
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSending || selectedContacts.length === 0}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Correo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}