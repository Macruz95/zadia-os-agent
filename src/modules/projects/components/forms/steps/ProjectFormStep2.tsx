'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CreateProjectInput } from '../../../validations/projects.validation';

/**
 * ProjectFormStep2 - Alcance y Entregables
 * Rule #2: ShadCN UI
 * Rule #3: Zod validation
 * Rule #5: 82 lines (within limit)
 */

const step2Schema = z.object({
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  tags: z.array(z.string()),
});

type Step2Data = z.infer<typeof step2Schema>;

interface ProjectFormStep2Props {
  data: Partial<CreateProjectInput>;
  onChange: (data: Partial<CreateProjectInput>) => void;
  onNext: () => void;
}

export function ProjectFormStep2({ data, onChange, onNext }: ProjectFormStep2Props) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      description: data.description || '',
      tags: data.tags || [],
    },
  });

  const onSubmit = (values: Step2Data) => {
    onChange(values);
    onNext();
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map((tag) => tag.trim()).filter(Boolean);
    form.setValue('tags', tags);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Proyecto</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe el alcance, entregables y objetivos del proyecto..."
                  rows={6}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {field.value?.length || 0}/500 caracteres
              </p>
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: mobiliario, corporativo, premium (separados por comas)"
                  defaultValue={field.value?.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </FormControl>
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
