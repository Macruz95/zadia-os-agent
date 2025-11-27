/**
 * ZADIA OS - Calendar Actions Hook
 * 
 * Integra acciones de calendario con el Event Bus central
 * Cada acción emite eventos que los agentes procesan automáticamente
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

interface EventData {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  type?: 'meeting' | 'appointment' | 'task' | 'reminder' | 'deadline' | 'holiday';
  location?: string;
  attendees?: Attendee[];
  relatedTo?: {
    type: 'client' | 'project' | 'order' | 'lead' | 'opportunity';
    id: string;
    name: string;
  };
  recurrence?: RecurrenceRule;
  reminders?: Reminder[];
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  [key: string]: unknown;
}

interface Attendee {
  id?: string;
  name: string;
  email: string;
  status?: 'pending' | 'accepted' | 'declined' | 'tentative';
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  until?: string;
  count?: number;
}

interface Reminder {
  type: 'email' | 'notification' | 'sms';
  minutes: number;
}

export function useCalendarActions() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREAR EVENTO
  // ═══════════════════════════════════════════════════════════════════════
  const createEvent = useCallback(async (data: Omit<EventData, 'id'> & { id?: string }) => {
    const eventId = data.id || `event-${Date.now()}`;
    
    await EventBus.emit('calendar:event_created', {
      eventId,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      allDay: data.allDay || false,
      type: data.type || 'meeting',
      location: data.location,
      attendees: data.attendees,
      relatedTo: data.relatedTo,
      status: 'scheduled'
    }, { source: 'calendar-module' });

    logger.info('✅ Calendar event created', { eventId, title: data.title });
    return eventId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR EVENTO
  // ═══════════════════════════════════════════════════════════════════════
  const updateEvent = useCallback(async (eventId: string, data: Partial<EventData>) => {
    await EventBus.emit('calendar:event_updated', {
      eventId,
      title: data.title,
      changes: data,
      updatedAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.info('✅ Calendar event updated', { eventId });
    return eventId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CANCELAR EVENTO
  // ═══════════════════════════════════════════════════════════════════════
  const cancelEvent = useCallback(async (
    eventId: string,
    title: string,
    reason?: string,
    notifyAttendees: boolean = true
  ) => {
    await EventBus.emit('calendar:event_cancelled', {
      eventId,
      title,
      reason,
      notifyAttendees,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.info('❌ Calendar event cancelled', { eventId, reason });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // REPROGRAMAR EVENTO
  // ═══════════════════════════════════════════════════════════════════════
  const rescheduleEvent = useCallback(async (
    eventId: string,
    title: string,
    newStartDate: string,
    newEndDate: string,
    reason?: string
  ) => {
    await EventBus.emit('calendar:event_rescheduled', {
      eventId,
      title,
      newStartDate,
      newEndDate,
      reason,
      rescheduledAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.info('📅 Event rescheduled', { eventId, newStartDate });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIRMAR ASISTENCIA
  // ═══════════════════════════════════════════════════════════════════════
  const confirmAttendance = useCallback(async (
    eventId: string,
    title: string,
    attendeeId: string,
    attendeeName: string,
    status: 'accepted' | 'declined' | 'tentative'
  ) => {
    await EventBus.emit('calendar:attendance_confirmed', {
      eventId,
      title,
      attendeeId,
      attendeeName,
      attendanceStatus: status,
      confirmedAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.info('✅ Attendance confirmed', { eventId, attendeeName, status });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // COMPLETAR EVENTO
  // ═══════════════════════════════════════════════════════════════════════
  const completeEvent = useCallback(async (
    eventId: string,
    title: string,
    outcome?: string,
    notes?: string
  ) => {
    await EventBus.emit('calendar:event_completed', {
      eventId,
      title,
      outcome,
      notes,
      status: 'completed',
      completedAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.info('✅ Event completed', { eventId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CREAR RECORDATORIO
  // ═══════════════════════════════════════════════════════════════════════
  const createReminder = useCallback(async (
    title: string,
    dueDate: string,
    relatedTo?: EventData['relatedTo']
  ) => {
    const reminderId = `reminder-${Date.now()}`;
    
    await EventBus.emit('calendar:reminder_created', {
      reminderId,
      title,
      dueDate,
      relatedTo,
      type: 'reminder',
      status: 'scheduled'
    }, { source: 'calendar-module' });

    logger.info('⏰ Reminder created', { reminderId, title });
    return reminderId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CREAR DEADLINE
  // ═══════════════════════════════════════════════════════════════════════
  const createDeadline = useCallback(async (
    title: string,
    dueDate: string,
    relatedTo: EventData['relatedTo'],
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ) => {
    const deadlineId = `deadline-${Date.now()}`;
    
    await EventBus.emit('calendar:deadline_created', {
      deadlineId,
      title,
      dueDate,
      relatedTo,
      priority,
      type: 'deadline',
      status: 'scheduled'
    }, { source: 'calendar-module' });

    logger.info('📌 Deadline created', { deadlineId, title, dueDate });
    return deadlineId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // PROGRAMAR REUNIÓN CON CLIENTE
  // ═══════════════════════════════════════════════════════════════════════
  const scheduleClientMeeting = useCallback(async (
    clientId: string,
    clientName: string,
    title: string,
    startDate: string,
    endDate: string,
    location?: string,
    agenda?: string
  ) => {
    const meetingId = `meeting-${Date.now()}`;
    
    await EventBus.emit('calendar:client_meeting_scheduled', {
      meetingId,
      clientId,
      clientName,
      title,
      startDate,
      endDate,
      location,
      agenda,
      type: 'meeting',
      relatedTo: { type: 'client', id: clientId, name: clientName }
    }, { source: 'calendar-module' });

    logger.info('🤝 Client meeting scheduled', { meetingId, clientName });
    return meetingId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ALERTA DE CONFLICTO
  // ═══════════════════════════════════════════════════════════════════════
  const reportConflict = useCallback(async (
    event1Id: string,
    event1Title: string,
    event2Id: string,
    event2Title: string,
    conflictTime: string
  ) => {
    await EventBus.emit('calendar:conflict_detected', {
      event1Id,
      event1Title,
      event2Id,
      event2Title,
      conflictTime,
      detectedAt: new Date().toISOString()
    }, { source: 'calendar-module' });

    logger.warn('⚠️ Calendar conflict detected', { event1Title, event2Title });
  }, []);

  return {
    // CRUD
    createEvent,
    updateEvent,
    cancelEvent,
    
    // Gestión
    rescheduleEvent,
    confirmAttendance,
    completeEvent,
    
    // Tipos especiales
    createReminder,
    createDeadline,
    scheduleClientMeeting,
    
    // Alertas
    reportConflict
  };
}
