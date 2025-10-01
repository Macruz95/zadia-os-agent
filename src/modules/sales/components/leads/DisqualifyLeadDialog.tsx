/**
 * ZADIA OS - Disqualify Lead Dialog Component
 * 
 * Dialog for disqualifying leads with reason selection
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserX } from 'lucide-react';

const disqualifySchema = z.object({
  reason: z.string().min(1, 'Debe seleccionar un motivo'),
  customReason: z.string().optional(),
  notes: z.string().optional(),
});

type DisqualifyFormData = z.infer<typeof disqualifySchema>;

interface DisqualifyLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  leadName: string;
  loading?: boolean;
}

const DISQUALIFY_REASONS = [
  { value: 'no_budget', label: 'Sin presupuesto' },
  { value: 'no_authority', label: 'No tiene autoridad de decisión' },
  { value: 'no_need', label: 'No tiene necesidad real' },
  { value: 'timing', label: 'Timing inadecuado' },
  { value: 'competitor', label: 'Eligió competencia' },
  { value: 'no_response', label: 'No responde a contactos' },
  { value: 'wrong_fit', label: 'No es buen fit para el producto' },
  { value: 'other', label: 'Otro motivo' },
];

export function DisqualifyLeadDialog({
  open,
  onOpenChange,
  onConfirm,
  leadName,
  loading = false,
}: DisqualifyLeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DisqualifyFormData>({
    resolver: zodResolver(disqualifySchema),
    defaultValues: {
      reason: '',
      customReason: '',
      notes: '',
    },
  });

  const selectedReason = form.watch('reason');

  const onSubmit = async (data: DisqualifyFormData) => {
    setIsSubmitting(true);
    try {
      const reasonText = data.reason === 'other' && data.customReason 
        ? data.customReason 
        : DISQUALIFY_REASONS.find(r => r.value === data.reason)?.label || data.reason;
      
      const fullReason = data.notes 
        ? `${reasonText}. Notas: ${data.notes}`
        : reasonText;

      await onConfirm(fullReason);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-orange-500" />
            <DialogTitle>Descalificar Lead</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Vas a descalificar el lead <strong>{leadName}</strong>.
            <br />
            Por favor, selecciona el motivo de descalificación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de descalificación *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISQUALIFY_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === 'other' && (
              <FormField
                control={form.control}
                name="customReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especifica el motivo *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el motivo de descalificación..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega cualquier información adicional..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Descalificando...' : 'Descalificar Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}