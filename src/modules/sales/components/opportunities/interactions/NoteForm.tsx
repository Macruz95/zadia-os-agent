/**
 * ZADIA OS - Note Interaction Form
 * 
 * Form for creating note interactions
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
import type { NoteInteractionInput } from '@/modules/sales/validations/opportunity-profile.schema';

interface NoteFormProps {
  form: UseFormReturn<NoteInteractionInput>;
  isSubmitting: boolean;
  onSubmit: (data: NoteInteractionInput) => Promise<void>;
}

export function NoteForm({ form, isSubmitting, onSubmit }: NoteFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-summary">Título *</Label>
        <Input
          id="note-summary"
          placeholder="Ej: Seguimiento post-propuesta"
          {...form.register('summary')}
        />
        {form.formState.errors.summary && (
          <p className="text-sm text-destructive">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-details">Nota</Label>
        <Textarea
          id="note-details"
          rows={4}
          placeholder="Escribe los detalles de la nota..."
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
        Guardar Nota
      </Button>
    </form>
  );
}
