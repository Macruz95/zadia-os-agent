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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Contact } from '../modules/clients/types/clients.types';
import { EmailService } from '../lib/email.service';
import { notificationService } from '../lib/notifications';

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

  // Filter contacts that have email
  const contactsWithEmail = contacts.filter(contact => contact.email && contact.email.trim() !== '');

  const handleSubmit = async (data: EmailFormData) => {
    if (contactsWithEmail.length === 0) {
      notificationService.error('No hay contactos con dirección de email válida');
      return;
    }

    setIsSending(true);
    try {
      const selectedContacts = contactsWithEmail.filter(contact =>
        data.selectedContacts.includes(contact.id)
      );

      const results = await EmailService.sendBulkEmails(
        selectedContacts.map(contact => ({
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
      console.error('Error sending emails:', error);
      notificationService.error('Error al enviar los correos');
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      form.setValue('selectedContacts', contactsWithEmail.map(c => c.id));
    } else {
      form.setValue('selectedContacts', []);
    }
  };

  if (contactsWithEmail.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Correo</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay contactos con dirección de email válida para este cliente.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Correo - {clientName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Contact Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Seleccionar Destinatarios</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Seleccionar todos
                  </Label>
                </div>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {contactsWithEmail.map((contact) => (
                  <FormField
                    key={contact.id}
                    control={form.control}
                    name="selectedContacts"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={contact.id}
                          checked={field.value?.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, contact.id]);
                            } else {
                              field.onChange(current.filter(id => id !== contact.id));
                            }
                          }}
                        />
                        <Label htmlFor={contact.id} className="text-sm">
                          {contact.name || 'Sin nombre'} - {contact.email}
                          {contact.role && (
                            <span className="text-muted-foreground ml-1">({contact.role})</span>
                          )}
                        </Label>
                      </div>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </div>

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <Label>Asunto</Label>
                  <FormControl>
                    <Input
                      placeholder="Asunto del correo"
                      {...field}
                      disabled={isSending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <Label>Contenido</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe el contenido del correo..."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isSending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
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