'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';

type EmailFormData = {
  subject: string;
  content: string;
  selectedContacts: string[];
};

interface EmailFormFieldsProps {
  control: Control<EmailFormData>;
  clientName: string;
}

export function EmailFormFields({ control, clientName }: EmailFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="subject"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="subject">Asunto</Label>
            <FormControl>
              <Input
                id="subject"
                placeholder={`Mensaje para ${clientName}`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="content">Mensaje</Label>
            <FormControl>
              <Textarea
                id="content"
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}