'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClients } from '@/modules/clients/hooks/use-clients';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateProjectInput } from '../../../validations/projects.validation';
import { Building2 } from 'lucide-react';

/**
 * ProjectFormStep1 - Información General
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #3: Zod validation
 * Rule #5: 158 lines (within limit)
 */

const step1Schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  projectType: z.enum(['production', 'service', 'internal']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  clientId: z.string().min(1, 'Seleccione un cliente'),
  clientName: z.string().min(1, 'Requerido'),
});

type Step1Data = z.infer<typeof step1Schema>;

interface ProjectFormStep1Props {
  data: Partial<CreateProjectInput>;
  onChange: (data: Partial<CreateProjectInput>) => void;
  onNext: () => void;
}

export function ProjectFormStep1({ data, onChange, onNext }: ProjectFormStep1Props) {
  const { user } = useAuth();
  const { clients } = useClients({ filters: {}, pageSize: 100 });

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: data.name || '',
      projectType: data.projectType || 'production',
      priority: data.priority || 'medium',
      clientId: data.clientId || '',
      clientName: data.clientName || '',
    },
  });

  const onSubmit = (values: Step1Data) => {
    onChange({
      ...values,
      createdBy: user?.uid || '',
    });
    onNext();
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      form.setValue('clientId', clientId);
      form.setValue('clientName', client.name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre del Proyecto */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proyecto *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Fabricación de Muebles Modulares"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Proyecto */}
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Proyecto *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="service">Servicio</SelectItem>
                  <SelectItem value="internal">Interno</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prioridad */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la prioridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cliente */}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <Select onValueChange={handleClientChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el cliente">
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>
                            {clients.find((c) => c.id === field.value)?.name}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{client.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    </Form>
  );
}
