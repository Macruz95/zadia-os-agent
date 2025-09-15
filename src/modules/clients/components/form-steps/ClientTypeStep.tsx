'use client';

import { UseFormReturn } from 'react-hook-form';
import { User } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientFormData } from '../../validations/clients.schema';

interface ClientTypeStepProps {
  form: UseFormReturn<ClientFormData>;
}

export function ClientTypeStep({ form }: ClientTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Seleccione el tipo de cliente</h3>
        <p className="text-muted-foreground">
          Esto determinará los campos que se mostrarán en los siguientes pasos
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="clientType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Cliente</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PersonaNatural">Persona Natural</SelectItem>
                <SelectItem value="Organización">Organización</SelectItem>
                <SelectItem value="Empresa">Empresa</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}