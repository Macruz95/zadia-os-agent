'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuoteConversionService, type ConversionConfig } from '@/modules/projects/services/quote-conversion.service';
import type { Quote } from '@/modules/sales/types/sales.types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Rule #2: ShadCN UI + Lucide Icons only

interface QuoteConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  userId: string;
}

export function QuoteConversionDialog({
  open,
  onOpenChange,
  quote,
  userId,
}: QuoteConversionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConversionConfig>({
    projectName: QuoteConversionService.generateProjectName(quote),
    projectDescription: quote.notes || '',
    priority: 'medium',
    startDate: new Date(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: quote.currency || 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const estimatedCost = QuoteConversionService.estimateProjectCost(quote);
  const estimatedDuration = QuoteConversionService.calculateEstimatedDuration(quote);

  const handleConvert = async () => {
    try {
      setLoading(true);

      const result = await QuoteConversionService.convertQuoteToProject(
        quote,
        config,
        userId
      );

      if (result.success && result.projectId) {
        toast.success('Proyecto creado exitosamente');
        onOpenChange(false);
        router.push(`/projects/${result.projectId}`);
      } else {
        toast.error(result.message || 'Error al crear el proyecto');
      }
    } catch {
      toast.error('Error al procesar la conversión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Convertir Cotización a Proyecto
          </DialogTitle>
          <DialogDescription>
            Genera un nuevo proyecto a partir de la cotización {quote.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">Resumen de Cotización</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cotización:</span>
                <span className="font-medium">{quote.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{quote.clientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(quote.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{quote.items.length} productos</span>
              </div>
            </div>
          </div>

          {/* Project Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Configuración del Proyecto</h3>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Nombre del Proyecto *</Label>
              <Input
                id="projectName"
                value={config.projectName || ''}
                onChange={(e) =>
                  setConfig({ ...config, projectName: e.target.value })
                }
                placeholder="Nombre del proyecto"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={config.projectDescription || ''}
                onChange={(e) =>
                  setConfig({ ...config, projectDescription: e.target.value })
                }
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
                    onSelect={(date) =>
                      setConfig({ ...config, startDate: date })
                    }
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
                    onSelect={(date) =>
                      setConfig({ ...config, estimatedEndDate: date })
                    }
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
                  setConfig({ ...config, priority: value as 'low' | 'medium' | 'high' | 'urgent' })
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
          </div>

          {/* Estimates */}
          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
              Estimaciones del Proyecto
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Precio de Venta:</span>
                <span className="font-bold">{formatCurrency(quote.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Costo Estimado (70%):</span>
                <span className="font-bold">{formatCurrency(estimatedCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                <span className="text-blue-700 dark:text-blue-300">Margen Estimado:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(quote.total - estimatedCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={config.notes || ''}
              onChange={(e) =>
                setConfig({ ...config, notes: e.target.value })
              }
              placeholder="Notas o instrucciones especiales..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleConvert} disabled={loading || !config.projectName}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
