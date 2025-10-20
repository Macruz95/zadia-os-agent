/**
 * ZADIA OS - Send Quote Email Dialog
 * 
 * Modal para enviar cotizaciones por email
 * Rule #2: ShadCN UI components + Lucide icons
 * Rule #3: Zod validation
 * Rule #4: Modular component
 * Rule #5: <200 líneas
 * 
 * @module SendQuoteEmailDialog
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { QuotesEmailService } from '@/modules/sales/services/quotes-email.service';
import type { Quote } from '@/modules/sales/types/sales.types';

/**
 * Validación del formulario
 */
const sendEmailSchema = z.object({
  to: z.string().email('Email inválido'),
  cc: z.string().email('Email inválido').or(z.literal('')).optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().optional(),
});

type SendEmailForm = z.infer<typeof sendEmailSchema>;

/**
 * Props del componente
 */
interface SendQuoteEmailDialogProps {
  quote: Quote;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Dialog para enviar cotización por email
 */
export function SendQuoteEmailDialog({
  quote,
  open,
  onClose,
  onSuccess,
}: SendQuoteEmailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SendEmailForm>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      to: '',
      cc: '',
      subject: `Cotización ${quote.number} - ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'ZADIA OS'}`,
      message: '',
    },
  });

  const onSubmit = async (data: SendEmailForm) => {
    setIsSubmitting(true);

    try {
      const result = await QuotesEmailService.sendQuoteEmail(quote, {
        to: data.to,
        cc: data.cc || undefined,
        subject: data.subject,
        message: data.message,
        attachPDF: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error enviando email');
      }

      toast.success('Cotización enviada por email correctamente');
      form.reset();
      onSuccess?.();
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <DialogTitle>Enviar Cotización por Email</DialogTitle>
          </div>
          <DialogDescription>
            Se enviará la cotización <strong>{quote.number}</strong> con el PDF adjunto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email destinatario */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="cliente@ejemplo.com"
                      type="email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CC opcional */}
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="copia@ejemplo.com"
                      type="email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asunto */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Asunto del email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mensaje personalizado */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje personalizado (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agregue un mensaje personalizado que se incluirá en el email..."
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Cotización
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
