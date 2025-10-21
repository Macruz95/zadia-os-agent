/**
 * ZADIA OS - Project Configuration Section
 * 
 * Configuration fields for new project from quote
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 */

'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ConversionConfig } from '../../services/quote-conversion.service';

interface ProjectConfigSectionProps {
  config: ConversionConfig;
  estimatedDuration: number;
  updateConfig: (updates: Partial<ConversionConfig>) => void;
}

export function ProjectConfigSection({
  config,
  estimatedDuration,
  updateConfig,
}: ProjectConfigSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Configuración del Proyecto</h3>

      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="projectName">Nombre del Proyecto *</Label>
        <Input
          id="projectName"
          value={config.projectName || ''}
          onChange={(e) => updateConfig({ projectName: e.target.value })}
          placeholder="Nombre del proyecto"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={config.projectDescription || ''}
          onChange={(e) => updateConfig({ projectDescription: e.target.value })}
          placeholder="Descripción del proyecto..."
          rows={3}
        />
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Fecha de Inicio *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !config.startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {config.startDate ? (
                format(config.startDate, 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={config.startDate}
              onSelect={(date) => updateConfig({ startDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Estimated End Date */}
      <div className="space-y-2">
        <Label>Fecha Estimada de Finalización</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !config.estimatedEndDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {config.estimatedEndDate ? (
                format(config.estimatedEndDate, 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha (opcional)</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={config.estimatedEndDate}
              onSelect={(date) => updateConfig({ estimatedEndDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Duración estimada: {estimatedDuration} semana{estimatedDuration !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">Prioridad</Label>
        <Select
          value={config.priority}
          onValueChange={(value) =>
            updateConfig({ priority: value as 'low' | 'medium' | 'high' | 'urgent' })
          }
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
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          value={config.notes || ''}
          onChange={(e) => updateConfig({ notes: e.target.value })}
          placeholder="Notas o instrucciones especiales..."
          rows={2}
        />
      </div>
    </div>
  );
}
