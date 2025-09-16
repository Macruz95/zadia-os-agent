'use client';

import { Control } from 'react-hook-form';
import { Trash2, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface ContactFormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<{ contacts: any[] }>;
  index: number;
  isPrimary: boolean;
  onRemove: () => void;
  onSetPrimary: () => void;
  canRemove: boolean;
}

export function ContactFormField({
  control,
  index,
  isPrimary,
  onRemove,
  onSetPrimary,
  canRemove
}: ContactFormFieldProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Contacto {index + 1}</span>
          {isPrimary && (
            <Badge variant="default" className="gap-1">
              <Star className="w-3 h-3" />
              Principal
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPrimary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSetPrimary}
            >
              <Star className="w-3 h-3" />
              Marcar principal
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField
          control={control}
          name={`contacts.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`contacts.${index}.role`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Gerente, Director" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`contacts.${index}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono *</FormLabel>
              <FormControl>
                <Input placeholder="Número de teléfono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`contacts.${index}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@contacto.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}