/**
 * ZADIA OS - Event Card Component
 * Tarjeta de evento para el calendario
 */

'use client';

import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { CalendarEvent } from '../types/calendar.types';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  showConflicts?: boolean;
}

export function EventCard({ event, onClick, showConflicts = false }: EventCardProps) {
  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : event.startDate.toDate();
  
  const endDate = event.endDate instanceof Date
    ? event.endDate
    : event.endDate.toDate();

  const hasConflicts = event.aiInsights?.conflictWarnings?.some(
    w => w.severity === 'high' || w.severity === 'medium'
  ) || false;

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const statusColors = {
    scheduled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-200",
        "bg-[#161b22] border-gray-800/50 hover:border-cyan-500/30",
        "hover:bg-[#1c2333] cursor-pointer",
        hasConflicts && showConflicts && "border-orange-500/50 bg-orange-500/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        
        {hasConflicts && showConflicts && (
          <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-2 mt-3">
        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {format(startDate, "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
            {' '}({event.duration} min)
          </span>
        </div>

        {/* Participantes */}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-3.5 w-3.5" />
            <span>{event.participants.length} participante{event.participants.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Ubicación */}
        {event.location && (
          <div className="text-sm text-gray-500">
            📍 {event.location}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge 
          variant="outline" 
          className={cn("text-xs", priorityColors[event.priority])}
        >
          {event.priority === 'urgent' ? 'Urgente' : 
           event.priority === 'high' ? 'Alta' :
           event.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn("text-xs", statusColors[event.status])}
        >
          {event.status === 'scheduled' ? 'Programado' :
           event.status === 'in-progress' ? 'En curso' :
           event.status === 'completed' ? 'Completado' : 'Cancelado'}
        </Badge>

        {event.type === 'meeting' && (
          <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
            Reunión
          </Badge>
        )}
      </div>

      {/* Conflict warnings */}
      {hasConflicts && showConflicts && event.aiInsights?.conflictWarnings && (
        <div className="mt-3 pt-3 border-t border-orange-500/20">
          <div className="text-xs text-orange-400 space-y-1">
            {event.aiInsights.conflictWarnings.slice(0, 2).map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

