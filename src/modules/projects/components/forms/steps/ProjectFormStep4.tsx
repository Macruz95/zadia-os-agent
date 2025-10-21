'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUsers, type User as UserType } from '@/hooks/use-users';
import type { CreateProjectInput } from '../../../validations/projects.validation';
import { CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ProjectFormStep4 - Fechas y Equipo
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #3: Zod validation
 * Rule #5: 175 lines (within limit)
 */

const step4Schema = z.object({
  startDate: z.date().optional(),
  estimatedEndDate: z.date().optional(),
  projectManager: z.string().min(1, 'Seleccione un Project Manager'),
  teamMembers: z.array(z.string()),
}).refine((data) => {
  if (data.startDate && data.estimatedEndDate) {
    return data.estimatedEndDate >= data.startDate;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['estimatedEndDate'],
});

type Step4Data = z.infer<typeof step4Schema>;

interface ProjectFormStep4Props {
  data: Partial<CreateProjectInput>;
  onChange: (data: Partial<CreateProjectInput>) => void;
  onSubmit: () => void;
}

export function ProjectFormStep4({ data, onChange, onSubmit }: ProjectFormStep4Props) {
  const { users } = useUsers();

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : undefined,
      projectManager: data.projectManager || '',
      teamMembers: data.teamMembers || [],
    },
  });

  const handleSubmit = (values: Step4Data) => {
    onChange(values);
    onSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Fecha de Inicio */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha Estimada de Fin */}
        <FormField
          control={form.control}
          name="estimatedEndDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha Estimada de Fin</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      form.getValues('startDate')
                        ? date < form.getValues('startDate')!
                        : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Manager */}
        <FormField
          control={form.control}
          name="projectManager"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Manager *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el Project Manager">
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {users.find((u: UserType) => u.uid === field.value)?.displayName}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user: UserType) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{user.displayName || user.email}</span>
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
          Crear Proyecto
        </Button>
      </form>
    </Form>
  );
}
