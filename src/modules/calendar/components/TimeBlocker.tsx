/**
 * ZADIA OS - Time Blocker Component
 * Componente para bloquear tiempo en el calendario
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { TimeBlock } from '../types/calendar.types';

interface TimeBlockerProps {
  onBlockTime: (block: Omit<TimeBlock, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  trigger?: React.ReactNode;
}

export function TimeBlocker({ onBlockTime, trigger }: TimeBlockerProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setHours(date.getHours() + 2);
    return date;
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      return;
    }

    try {
      setLoading(true);
      await onBlockTime({
        title,
        description,
        startDate: startDate,
        endDate: endDate,
        isRecurring,
        recurrenceRule: isRecurring ? {
          frequency: 'daily',
          interval: 1
        } : undefined
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartDate(new Date());
      setEndDate(() => {
        const date = new Date();
        date.setHours(date.getHours() + 2);
        return date;
      });
      setIsRecurring(false);
      setOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="bg-[#161b22] border-gray-800/50 hover:border-cyan-500/30">
            <Clock className="h-4 w-4 mr-2" />
            Bloquear Tiempo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#161b22] border-gray-800/50 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bloquear Tiempo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Reserva tiempo en tu calendario para trabajo enfocado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Trabajo enfocado, Revisión de código..."
              className="bg-[#0d1117] border-gray-800/50"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre este bloque de tiempo..."
              className="bg-[#0d1117] border-gray-800/50 min-h-[80px]"
            />
          </div>

          {/* Fecha y hora inicio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha y Hora Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#0d1117] border-gray-800/50",
                      !startDate && "text-gray-400"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP 'a las' HH:mm", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#161b22] border-gray-800/50">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha y hora fin */}
            <div className="space-y-2">
              <Label>Fecha y Hora Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#0d1117] border-gray-800/50",
                      !endDate && "text-gray-400"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP 'a las' HH:mm", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#161b22] border-gray-800/50">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Recurrencia */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-800/50 bg-[#0d1117]"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Recurrente (diario)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-[#0d1117] border-gray-800/50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !title || !startDate || !endDate}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {loading ? 'Guardando...' : 'Bloquear Tiempo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

