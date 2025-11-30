/**
 * ZADIA OS - Event Creator Component
 * Componente para crear nuevos eventos en el calendario
 */

'use client';

import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types/calendar.types';

interface EventCreatorProps {
  onCreateEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  trigger?: React.ReactNode;
  defaultDate?: Date;
}

export function EventCreator({ onCreateEvent, trigger, defaultDate }: EventCreatorProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'task' | 'reminder' | 'block'>('meeting');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [startDate, setStartDate] = useState<Date | undefined>(defaultDate || new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDate || new Date());
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const combineDateTime = (date: Date | undefined, time: string): Date => {
    if (!date) return new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      return;
    }

    try {
      setLoading(true);
      
      const startDateTime = combineDateTime(startDate, startTime);
      const endDateTime = combineDateTime(endDate, endTime);
      const durationMinutes = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));

      await onCreateEvent({
        userId: '',
        title,
        description,
        type: eventType,
        status: 'scheduled',
        priority,
        startDate: startDateTime,
        endDate: endDateTime,
        duration: durationMinutes,
        location: location || undefined,
        createdBy: '',
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setEventType('meeting');
      setPriority('medium');
      setStartDate(new Date());
      setStartTime('09:00');
      setEndDate(new Date());
      setEndTime('10:00');
      setLocation('');
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
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#161b22] border-gray-800/50 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Evento</DialogTitle>
          <DialogDescription className="text-gray-400">
            Crea un nuevo evento en tu calendario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="event-title">Título</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión con cliente, Revisión de proyecto..."
              className="bg-[#0d1117] border-gray-800/50"
              required
            />
          </div>

          {/* Tipo y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as typeof eventType)}>
                <SelectTrigger className="bg-[#0d1117] border-gray-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-800/50">
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="task">Tarea</SelectItem>
                  <SelectItem value="reminder">Recordatorio</SelectItem>
                  <SelectItem value="block">Bloque de Tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="bg-[#0d1117] border-gray-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-800/50">
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Descripción (opcional)</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el evento..."
              className="bg-[#0d1117] border-gray-800/50 min-h-[80px]"
            />
          </div>

          {/* Fecha y hora inicio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
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
                      format(startDate, "PPP", { locale: es })
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

            <div className="space-y-2">
              <Label>Hora Inicio</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-[#0d1117] border-gray-800/50"
              />
            </div>
          </div>

          {/* Fecha y hora fin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
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
                      format(endDate, "PPP", { locale: es })
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

            <div className="space-y-2">
              <Label>Hora Fin</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-[#0d1117] border-gray-800/50"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="event-location">Ubicación (opcional)</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Sala de juntas, Google Meet, Oficina..."
              className="bg-[#0d1117] border-gray-800/50"
            />
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
              {loading ? 'Guardando...' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
