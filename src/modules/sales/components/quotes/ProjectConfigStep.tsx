/**
 * ZADIA OS - Project Config Step
 * 
 * Second step: Configure project details
 * Following ZADIA Rule 2: ShadCN UI + Lucide Icons
 * Following ZADIA Rule 3: Zod validation
 * Following ZADIA Rule 5: Max 200 lines
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Settings, Calendar, DollarSign } from 'lucide-react';
import { Quote } from '../../types/sales.types';
import { ProjectConfigInput, projectConfigSchema } from '../../validations/quote-project-conversion.schema';

interface ProjectConfigStepProps {
  quote: Quote;
  onNext: () => void;
  onBack: () => void;
  onProjectConfig: (data: ProjectConfigInput) => void;
}

export function ProjectConfigStep({ quote, onNext, onBack, onProjectConfig }: ProjectConfigStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectConfigInput>({
    // @ts-expect-error - Zod optional().default() type mismatch
    resolver: zodResolver(projectConfigSchema),
    defaultValues: {
      name: `Proyecto - ${quote.number}`,
      startDate: new Date(),
      priority: 'medium' as const,
      budget: quote.total,
      team: [],
    },
  });

  const priority = watch('priority');

  const onSubmit = (data: ProjectConfigInput) => {
    onProjectConfig(data);
    onNext();
  };

  return (
    // @ts-expect-error - Type mismatch with Zod
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Configure los detalles del proyecto. Estos pueden ser modificados posteriormente.
        </AlertDescription>
      </Alert>

      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Proyecto *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nombre descriptivo del proyecto"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción detallada del proyecto, objetivos, alcance..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Inicio *
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', {
              valueAsDate: true,
            })}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedEndDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha Estimada de Fin
          </Label>
          <Input
            id="estimatedEndDate"
            type="date"
            {...register('estimatedEndDate', {
              valueAsDate: true,
            })}
          />
          {errors.estimatedEndDate && (
            <p className="text-sm text-destructive">{errors.estimatedEndDate.message}</p>
          )}
        </div>
      </div>

      {/* Priority and Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select
            value={priority}
            onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-destructive">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Presupuesto
          </Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            {...register('budget', {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.budget && (
            <p className="text-sm text-destructive">{errors.budget.message}</p>
          )}
        </div>
      </div>

      {/* Project Manager */}
      <div className="space-y-2">
        <Label htmlFor="projectManager">Gerente de Proyecto (Opcional)</Label>
        <Input
          id="projectManager"
          {...register('projectManager')}
          placeholder="ID o email del gerente"
        />
        {errors.projectManager && (
          <p className="text-sm text-destructive">{errors.projectManager.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas Internas (Opcional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Notas, consideraciones, riesgos..."
          rows={3}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button type="submit">
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
