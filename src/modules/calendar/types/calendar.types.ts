/**
 * ZADIA OS - Calendar Types
 * Tipos para Agenda Cognitiva
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Tipo de evento en el calendario
 */
export type CalendarEventType = 
  | 'meeting'
  | 'task'
  | 'block'
  | 'reminder'
  | 'deadline';

/**
 * Estado del evento
 */
export type EventStatus = 
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

/**
 * Prioridad del evento
 */
export type EventPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

/**
 * Evento del calendario
 */
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  status: EventStatus;
  priority: EventPriority;
  
  // Fechas
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  duration: number; // minutos
  
  // Participantes y contexto
  participants?: string[];
  relatedClientId?: string;
  relatedProjectId?: string;
  relatedOpportunityId?: string;
  
  // Ubicación
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  
  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  
  // IA Cognitiva
  aiInsights?: EventAIInsights;
  conflictResolution?: ConflictResolution;
}

/**
 * Insights de IA para el evento
 */
export interface EventAIInsights {
  suggestedTime?: Date;
  conflictWarnings?: ConflictWarning[];
  preparationTips?: string[];
  agendaSuggestions?: string[];
  participantAvailability?: ParticipantAvailability[];
  estimatedDuration?: number;
  optimalTime?: Date;
}

/**
 * Advertencia de conflicto
 */
export interface ConflictWarning {
  type: 'overlap' | 'travel-time' | 'preparation-time' | 'priority';
  severity: 'low' | 'medium' | 'high';
  message: string;
  conflictingEventId?: string;
  suggestedResolution?: string;
}

/**
 * Resolución de conflicto sugerida por IA
 */
export interface ConflictResolution {
  originalEventId: string;
  suggestedTime: Date;
  reason: string;
  confidence: number; // 0-1
  alternativeTimes?: Date[];
}

/**
 * Disponibilidad de participante
 */
export interface ParticipantAvailability {
  participantId: string;
  participantName: string;
  available: boolean;
  conflicts?: string[];
  suggestedTimes?: Date[];
}

/**
 * Bloqueo de tiempo
 */
export interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  createdAt: Timestamp | Date;
}

/**
 * Regla de recurrencia
 */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[]; // 0 = domingo, 6 = sábado
}

/**
 * Dossier de reunión generado por IA
 */
export interface MeetingDossier {
  eventId: string;
  agenda: AgendaItem[];
  participants: ParticipantInfo[];
  context: MeetingContext;
  actionItems?: ActionItem[];
  notes?: string;
  generatedAt: Timestamp | Date;
}

/**
 * Item de agenda
 */
export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  assignedTo?: string;
}

/**
 * Información del participante
 */
export interface ParticipantInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
  availability: 'confirmed' | 'tentative' | 'declined';
  preparationNotes?: string;
}

/**
 * Contexto de la reunión
 */
export interface MeetingContext {
  relatedClient?: {
    id: string;
    name: string;
  };
  relatedProject?: {
    id: string;
    name: string;
  };
  relatedOpportunity?: {
    id: string;
    name: string;
  };
  previousMeetings?: string[];
  relevantDocuments?: string[];
}

/**
 * Item de acción
 */
export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: Date;
  priority: EventPriority;
  status: 'pending' | 'in-progress' | 'completed';
}

