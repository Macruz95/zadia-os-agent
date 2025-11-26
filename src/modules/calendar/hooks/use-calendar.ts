/**
 * ZADIA OS - Calendar Hook
 * Hook personalizado para gestión de calendario
 * Rule #1: Real data from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { CalendarService } from '../services/calendar.service';
import type { 
  CalendarEvent, 
  EventAIInsights,
  MeetingDossier
} from '../types/calendar.types';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Operaciones CRUD
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Funciones de IA
  analyzeConflicts: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EventAIInsights>;
  generateDossier: (eventId: string, context?: {
    clientName?: string;
    projectName?: string;
    opportunityName?: string;
  }) => Promise<MeetingDossier | null>;
  
  // Utilidades
  getEventsByDate: (date: Date) => CalendarEvent[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export function useCalendar(): UseCalendarReturn {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar eventos del usuario
   */
  const loadEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      const loadedEvents = await CalendarService.getEventsByDateRange(
        user.uid,
        start,
        end
      );

      setEvents(loadedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar eventos';
      setError(errorMessage);
      logger.error('Failed to load calendar events', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * Crear evento
   */
  const createEvent = useCallback(async (
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const eventId = await CalendarService.createEvent(event, user.uid);
      await loadEvents(); // Recargar eventos
      return eventId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear evento';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid, loadEvents]);

  /**
   * Actualizar evento
   */
  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> => {
    try {
      await CalendarService.updateEvent(eventId, updates);
      await loadEvents(); // Recargar eventos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar evento';
      setError(errorMessage);
      throw err;
    }
  }, [loadEvents]);

  /**
   * Eliminar evento
   */
  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      await CalendarService.deleteEvent(eventId);
      await loadEvents(); // Recargar eventos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar evento';
      setError(errorMessage);
      throw err;
    }
  }, [loadEvents]);

  /**
   * Analizar conflictos con IA
   */
  const analyzeConflicts = useCallback(async (
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventAIInsights> => {
    try {
      const insights = await CalendarService.analyzeConflicts(event, events);
      return insights;
    } catch (err) {
      logger.error('Failed to analyze conflicts', err as Error);
      return {
        conflictWarnings: [],
        preparationTips: []
      };
    }
  }, [events]);

  /**
   * Generar dossier de reunión
   */
  const generateDossier = useCallback(async (
    eventId: string,
    context?: {
      clientName?: string;
      projectName?: string;
      opportunityName?: string;
    }
  ): Promise<MeetingDossier | null> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        return null;
      }

      const dossier = await CalendarService.generateMeetingDossier(event, context);
      return dossier;
    } catch (err) {
      logger.error('Failed to generate dossier', err as Error);
      return null;
    }
  }, [events]);

  /**
   * Obtener eventos de una fecha específica
   */
  const getEventsByDate = useCallback((date: Date): CalendarEvent[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventDate = event.startDate instanceof Date 
        ? event.startDate 
        : event.startDate.toDate();
      
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
  }, [events]);

  /**
   * Cargar eventos por rango de fechas
   */
  const getEventsByDateRange = useCallback(async (
    startDate: Date,
    endDate: Date
  ): Promise<void> => {
    await loadEvents(startDate, endDate);
  }, [loadEvents]);

  /**
   * Refrescar eventos
   */
  const refreshEvents = useCallback(async (): Promise<void> => {
    await loadEvents();
  }, [loadEvents]);

  // Cargar eventos al montar
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    analyzeConflicts,
    generateDossier,
    getEventsByDate,
    getEventsByDateRange,
    refreshEvents
  };
}

