/**
 * ZADIA OS - Meeting Interaction Form
 * 
 * Form for creating meeting interactions
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
import type { MeetingInteractionInput } from '@/modules/sales/validations/opportunity-profile.schema';

interface MeetingFormProps {
  form: UseFormReturn<MeetingInteractionInput>;
  isSubmitting: boolean;
  onSubmit: (data: MeetingInteractionInput) => Promise<void>;
}

export function MeetingForm({ form, isSubmitting, onSubmit }: MeetingFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="meeting-summary">Título *</Label>
        <Input
          id="meeting-summary"
          placeholder="Ej: Reunión de presentación"
          {...form.register('summary')}
        />
        {form.formState.errors.summary && (
          <p className="text-sm text-destructive">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-location">Ubicación</Label>
        <Input
          id="meeting-location"
          placeholder="Ej: Oficina cliente, Zoom, etc."
          {...form.register('location')}
        />
        {form.formState.errors.location && (
          <p className="text-sm text-destructive">
            {form.formState.errors.location.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-details">Resumen de la reunión</Label>
        <Textarea
          id="meeting-details"
          rows={4}
          placeholder="Temas tratados, acuerdos, próximos pasos..."
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
        Registrar Reunión
      </Button>
    </form>
  );
}
