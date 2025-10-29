/**
 * ZADIA OS - Send Invoice Email Dialog
 * 
 * Modal component for sending invoices via email
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 3: Zod validation
 * REGLA 4: Modular
 * REGLA 5: ~200 líneas
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from '@/modules/finance/types/finance.types';
import { InvoicesEmailService } from '@/modules/finance/services/invoices-email.service';

// Validation schema
const emailFormSchema = z.object({
  to: z.string().email('Email inválido'),
  cc: z.string().email('Email inválido').optional().or(z.literal('')),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().optional(),
});

type EmailFormData = z.infer<typeof emailFormSchema>;

interface SendInvoiceEmailDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendInvoiceEmailDialog({
  invoice,
  open,
  onClose,
  onSuccess,
}: SendInvoiceEmailDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: '',
      cc: '',
      subject: `Factura ${invoice.number} - ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA'}`,
      message: '',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    try {
      setIsSending(true);

      await InvoicesEmailService.sendInvoiceEmail({
        invoiceId: invoice.id,
        recipientEmail: data.to,
        customMessage: data.message || undefined,
        sendCopy: !!data.cc,
        copyEmail: data.cc || undefined,
      });

      toast.success('Email enviado correctamente', {
        description: `Factura ${invoice.number} enviada a ${data.to}`,
      });

      form.reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Error al enviar email', {
        description:
          error instanceof Error ? error.message : 'Intente nuevamente',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Factura por Email
          </DialogTitle>
          <DialogDescription>
            Enviar <strong>{invoice.number}</strong> al cliente con PDF adjunto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* To */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="cliente@email.com"
                      type="email"
                      disabled={isSending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CC */}
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="copia@email.com"
                      type="email"
                      disabled={isSending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Asunto del email"
                      disabled={isSending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje Personalizado (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agregar un mensaje personalizado al email..."
                      rows={4}
                      disabled={isSending}
                      {...field}
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
                onClick={onClose}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Factura
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
