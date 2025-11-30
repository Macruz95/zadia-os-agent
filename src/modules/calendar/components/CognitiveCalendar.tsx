/**
 * ZADIA OS - Cognitive Calendar Component
 * Vista principal del calendario con IA cognitiva
 */

'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import { useCalendar } from '../hooks/use-calendar';
import { EventCard } from './EventCard';
import { TimeBlocker } from './TimeBlocker';
import { EventCreator } from './EventCreator';
import { MeetingDossier } from './MeetingDossier';

import type { CalendarEvent } from '../types/calendar.types';

export function CognitiveCalendar() {
  const { events, loading, createEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.startDate instanceof Date ? event.startDate : event.startDate.toDate());
  };

  const handleBlockTime = async (block: Parameters<typeof TimeBlocker>[0]['onBlockTime'] extends (block: infer T) => Promise<void> ? T : never) => {
    const getTimeValue = (date: Date | import('firebase/firestore').Timestamp): number => {
      return date instanceof Date ? date.getTime() : date.toMillis();
    };
    
    const startTime = getTimeValue(block.startDate);
    const endTime = getTimeValue(block.endDate);
    
    const event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: '',
      title: block.title,
      description: block.description,
      type: 'block',
      status: 'scheduled',
      priority: 'medium',
      startDate: block.startDate,
      endDate: block.endDate,
      duration: Math.round((endTime - startTime) / (1000 * 60)),
      createdBy: '',
    };

    await createEvent(event);
  };

  const handleCreateEvent = async (newEvent: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createEvent(newEvent);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.startDate instanceof Date 
        ? event.startDate 
        : event.startDate.toDate();
      return isSameDay(eventDate, date);
    });
  };

  const getConflictsCount = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter(e => 
      e.aiInsights?.conflictWarnings?.some(w => w.severity === 'high' || w.severity === 'medium')
    ).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-cyan-400" />
            Agenda Cognitiva
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Calendario inteligente con análisis de conflictos y optimización de horarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeBlocker onBlockTime={handleBlockTime} />
          <EventCreator onCreateEvent={handleCreateEvent} defaultDate={selectedDate || undefined} />
        </div>
      </div>

      {/* Vista principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card className="bg-[#161b22] border-gray-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {format(currentDate, "MMMM yyyy", { locale: es })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-2">
                {/* Headers de días */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Días del mes */}
                {daysInMonth.map(day => {
                  const dayEvents = getEventsForDate(day);
                  const conflicts = getConflictsCount(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "min-h-[80px] p-2 rounded-lg border transition-all duration-200",
                        "bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/30",
                        isToday && "border-cyan-500/50 bg-cyan-500/10",
                        isSelected && "border-cyan-500 bg-cyan-500/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-sm font-medium",
                          isToday ? "text-cyan-400" : "text-gray-200",
                          isSelected && "text-white"
                        )}>
                          {format(day, 'd')}
                        </span>
                        {conflicts > 0 && (
                          <AlertTriangle className="h-3 w-3 text-orange-400" />
                        )}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer",
                                event.type === 'meeting' ? "bg-purple-500/20 text-purple-400" :
                                event.type === 'block' ? "bg-blue-500/20 text-blue-400" :
                                "bg-gray-500/20 text-gray-400"
                              )}
                            >
                              {format(event.startDate instanceof Date ? event.startDate : event.startDate.toDate(), 'HH:mm')} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Eventos del día seleccionado */}
          {selectedDate && (
            <Card className="bg-[#161b22] border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay eventos programados</p>
                  </div>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      showConflicts
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Dossier de reunión */}
          {selectedEvent && selectedEvent.type === 'meeting' && (
            <MeetingDossier event={selectedEvent} />
          )}
        </div>
      </div>
    </div>
  );
}

