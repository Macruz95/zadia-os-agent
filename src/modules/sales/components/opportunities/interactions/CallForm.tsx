/**
 * ZADIA OS - Call Interaction Form
 * 
 * Form for creating call interactions
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { type UseFormReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CallInteractionInput } from '@/modules/sales/validations/opportunity-profile.schema';

interface CallFormProps {
  form: UseFormReturn<CallInteractionInput>;
  isSubmitting: boolean;
  onSubmit: (data: CallInteractionInput) => Promise<void>;
}

export function CallForm({ form, isSubmitting, onSubmit }: CallFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="call-summary">Título *</Label>
        <Input
          id="call-summary"
          placeholder="Ej: Llamada de seguimiento"
          {...form.register('summary')}
        />
        {form.formState.errors.summary && (
          <p className="text-sm text-destructive">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="call-duration">Duración (minutos)</Label>
        <Input
          id="call-duration"
          type="number"
          min="1"
          placeholder="30"
          {...form.register('duration', { valueAsNumber: true })}
        />
        {form.formState.errors.duration && (
          <p className="text-sm text-destructive">
            {form.formState.errors.duration.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="call-details">Notas de la llamada</Label>
        <Textarea
          id="call-details"
          rows={4}
          placeholder="Resumen de la conversación..."
          {...form.register('details')}
        />
        {form.formState.errors.details && (
          <p className="text-sm text-destructive">
            {form.formState.errors.details.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Registrar Llamada
      </Button>
    </form>
  );
}
