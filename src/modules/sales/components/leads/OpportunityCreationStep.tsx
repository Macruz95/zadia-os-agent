/**
 * ZADIA OS - Opportunity Creation Step
 * 
 * Third step of conversion wizard - creates opportunity
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
import { Lead } from '../../types/sales.types';
import {
  OpportunityFromConversionInput,
  opportunityFromConversionSchema,
  ClientFromLeadInput
} from '../../validations/lead-conversion.schema';
import { DEFAULT_CURRENCY } from '@/config/defaults';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface OpportunityCreationStepProps {
  lead: Lead;
  clientData: ClientFromLeadInput | null;
  onNext: () => void;
  onBack: () => void;
  onOpportunityData: (data: OpportunityFromConversionInput) => void;
}

export function OpportunityCreationStep({
  lead,
  clientData,
  onNext,
  onBack,
  onOpportunityData
}: OpportunityCreationStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Omit<OpportunityFromConversionInput, 'clientId' | 'source'>>({
    // @ts-expect-error - Zod optional().default() creates type mismatch with React Hook Form
    resolver: zodResolver(
      opportunityFromConversionSchema.omit({ clientId: true, source: true })
    ),
    defaultValues: {
      name: `Oportunidad de ${clientData?.name || lead.fullName || lead.entityName}`,
      estimatedValue: 0,
      currency: DEFAULT_CURRENCY,
      stage: 'qualified' as const,
      status: 'open' as const,
      probability: 20,
      priority: 'medium' as const,
    },
  });

  const stage = watch('stage');
  const priority = watch('priority');

  const onSubmit = (data: Omit<OpportunityFromConversionInput, 'clientId' | 'source'>) => {
    onOpportunityData({
      ...data,
      clientId: '', // Will be set by conversion service
      source: lead.id,
    });
    onNext();
  };

  return (
    // @ts-expect-error - Type mismatch between Zod optional defaults and React Hook Form
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <Briefcase className="h-4 w-4" />
        <AlertDescription>
          Configure los detalles de la oportunidad comercial. Los campos marcados con * son obligatorios.
        </AlertDescription>
      </Alert>

      {/* Opportunity Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Oportunidad *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ej: Venta de muebles de oficina"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Estimated Value and Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="estimatedValue">Valor Estimado *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="estimatedValue"
              type="number"
              step="0.01"
              min="0"
              {...register('estimatedValue', { valueAsNumber: true })}
              className="pl-9"
              placeholder="0.00"
            />
          </div>
          {errors.estimatedValue && (
            <p className="text-sm text-destructive">{errors.estimatedValue.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="MXN">MXN ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stage and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Etapa del Pipeline *</Label>
          <Select
            value={stage}
            onValueChange={(value) => setValue('stage', value as 'qualified' | 'proposal-sent' | 'negotiation' | 'closed-won' | 'closed-lost')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualified">Calificado</SelectItem>
              <SelectItem value="proposal-sent">Propuesta Enviada</SelectItem>
              <SelectItem value="negotiation">Negociación</SelectItem>
              <SelectItem value="closed-won">Cerrado Ganado</SelectItem>
              <SelectItem value="closed-lost">Cerrado Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select
            value={priority}
            onValueChange={(value) => setValue('priority', value as 'high' | 'medium' | 'low')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expected Close Date */}
      <div className="space-y-2">
        <Label htmlFor="expectedCloseDate">Fecha Estimada de Cierre</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="expectedCloseDate"
            type="date"
            {...register('expectedCloseDate', {
              setValueAs: (value) => (value ? new Date(value) : undefined),
            })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Detalles adicionales sobre esta oportunidad..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button type="submit">
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
