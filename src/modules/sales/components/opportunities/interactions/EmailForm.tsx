/**
 * ZADIA OS - Email Interaction Form
 * 
 * Form for creating email interactions
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
import type { EmailInteractionInput } from '@/modules/sales/validations/opportunity-profile.schema';

interface EmailFormProps {
  form: UseFormReturn<EmailInteractionInput>;
  isSubmitting: boolean;
  onSubmit: (data: EmailInteractionInput) => Promise<void>;
}

export function EmailForm({ form, isSubmitting, onSubmit }: EmailFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-summary">Asunto *</Label>
        <Input
          id="email-summary"
          placeholder="Ej: Propuesta comercial - Proyecto X"
          {...form.register('summary')}
        />
        {form.formState.errors.summary && (
          <p className="text-sm text-destructive">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-details">Contenido del email</Label>
        <Textarea
          id="email-details"
          rows={4}
          placeholder="Resumen del contenido del email enviado..."
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
        Registrar Email
      </Button>
    </form>
  );
}
