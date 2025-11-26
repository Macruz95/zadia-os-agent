/**
 * ZADIA OS - Calendar Service
 * Servicio para gestión de calendario con IA cognitiva
 * Rule #1: Real data from Firebase
 * Rule #3: No mocks
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { OpenRouterService } from '@/lib/ai/openrouter.service';
import type { 
  CalendarEvent, 
  EventAIInsights, 
  MeetingDossier
} from '../types/calendar.types';

export class CalendarService {
  private static readonly COLLECTION = 'events';

  /**
   * Crear evento en el calendario
   */
  static async createEvent(
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const eventData = {
        ...event,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        startDate: event.startDate instanceof Date 
          ? Timestamp.fromDate(event.startDate)
          : event.startDate,
        endDate: event.endDate instanceof Date
          ? Timestamp.fromDate(event.endDate)
          : event.endDate,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), eventData);
      
      logger.info('Calendar event created', {
        component: 'CalendarService',
        metadata: { eventId: docRef.id, userId }
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create calendar event', error as Error);
      throw error;
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const docRef = doc(db, this.COLLECTION, eventId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CalendarEvent;
    } catch (error) {
      logger.error('Failed to get calendar event', error as Error);
      throw error;
    }
  }

  /**
   * Obtener eventos del usuario en un rango de fechas
   */
  static async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('startDate', '>=', startTimestamp),
        where('startDate', '<=', endTimestamp),
        orderBy('startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const events: CalendarEvent[] = [];

      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        } as CalendarEvent);
      });

      return events;
    } catch (error) {
      logger.error('Failed to get events by date range', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar evento
   */
  static async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, eventId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convertir fechas a Timestamp si es necesario
      if (updates.startDate && updates.startDate instanceof Date) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate && updates.endDate instanceof Date) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }

      await updateDoc(docRef, updateData);
      
      logger.info('Calendar event updated', {
        component: 'CalendarService',
        metadata: { eventId }
      });
    } catch (error) {
      logger.error('Failed to update calendar event', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar evento
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, eventId);
      await deleteDoc(docRef);
      
      logger.info('Calendar event deleted', {
        component: 'CalendarService',
        metadata: { eventId }
      });
    } catch (error) {
      logger.error('Failed to delete calendar event', error as Error);
      throw error;
    }
  }

  /**
   * Analizar conflictos y obtener insights de IA
   * Usa DeepSeek R1 para razonamiento profundo
   */
  static async analyzeConflicts(
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
    existingEvents: CalendarEvent[]
  ): Promise<EventAIInsights> {
    try {
      const systemPrompt = `Eres un asistente de calendario experto de ZADIA OS.
Analiza conflictos de calendario, optimiza horarios y proporciona recomendaciones inteligentes.
Usa razonamiento paso a paso para identificar problemas y sugerir soluciones.`;

      const userPrompt = `Analiza este nuevo evento y los eventos existentes para detectar conflictos:

NUEVO EVENTO:
- Título: ${event.title}
- Fecha inicio: ${event.startDate instanceof Date ? event.startDate.toISOString() : event.startDate}
- Duración: ${event.duration} minutos
- Prioridad: ${event.priority}
- Participantes: ${event.participants?.join(', ') || 'N/A'}

EVENTOS EXISTENTES:
${existingEvents.map(e => `
- ${e.title} (${e.startDate instanceof Date ? e.startDate.toISOString() : e.startDate}) - ${e.duration}min - Prioridad: ${e.priority}
`).join('')}

Proporciona:
1. Conflictos detectados (overlaps, tiempo de viaje, preparación)
2. Tiempo sugerido alternativo si hay conflictos
3. Advertencias de prioridad
4. Recomendaciones de preparación

Responde en formato JSON con esta estructura:
{
  "conflictWarnings": [
    {
      "type": "overlap|travel-time|preparation-time|priority",
      "severity": "low|medium|high",
      "message": "descripción",
      "conflictingEventId": "id si aplica",
      "suggestedResolution": "sugerencia"
    }
  ],
  "suggestedTime": "ISO date si hay conflicto",
  "optimalTime": "ISO date mejor opción",
  "preparationTips": ["tip1", "tip2"],
  "estimatedDuration": número en minutos
}`;

      const response = await OpenRouterService.reason(
        userPrompt,
        systemPrompt,
        { event, existingEvents }
      );

      // Parsear respuesta JSON
      try {
        const insights = JSON.parse(response) as EventAIInsights;
        return insights;
      } catch {
        // Si no es JSON válido, crear estructura básica
        return {
          conflictWarnings: [{
            type: 'overlap',
            severity: 'medium',
            message: 'Revisa posibles conflictos manualmente'
          }],
          preparationTips: []
        };
      }
    } catch (error) {
      logger.error('Failed to analyze conflicts with AI', error as Error);
      return {
        conflictWarnings: [],
        preparationTips: []
      };
    }
  }

  /**
   * Generar dossier de reunión con IA
   * Usa DeepSeek R1 para análisis profundo
   */
  static async generateMeetingDossier(
    event: CalendarEvent,
    context?: {
      clientName?: string;
      projectName?: string;
      opportunityName?: string;
      previousMeetings?: CalendarEvent[];
    }
  ): Promise<MeetingDossier> {
    try {
      const systemPrompt = `Eres un asistente ejecutivo experto de ZADIA OS.
Genera dossiers de reunión profesionales con agenda, contexto y action items.
Usa razonamiento profundo para crear contenido relevante y accionable.`;

      const userPrompt = `Genera un dossier completo para esta reunión:

EVENTO:
- Título: ${event.title}
- Fecha: ${event.startDate instanceof Date ? event.startDate.toISOString() : event.startDate}
- Duración: ${event.duration} minutos
- Participantes: ${event.participants?.join(', ') || 'N/A'}
- Descripción: ${event.description || 'N/A'}

CONTEXTO:
${context?.clientName ? `- Cliente: ${context.clientName}` : ''}
${context?.projectName ? `- Proyecto: ${context.projectName}` : ''}
${context?.opportunityName ? `- Oportunidad: ${context.opportunityName}` : ''}
${context?.previousMeetings?.length ? `- Reuniones previas: ${context.previousMeetings.length}` : ''}

Crea:
1. Agenda estructurada con items y tiempos
2. Notas de preparación
3. Action items sugeridos
4. Contexto relevante

Responde en formato JSON con esta estructura:
{
  "agenda": [
    {
      "title": "título",
      "description": "descripción",
      "duration": número en minutos,
      "order": número
    }
  ],
  "notes": "notas generales",
  "actionItems": [
    {
      "title": "título",
      "description": "descripción",
      "priority": "low|medium|high|urgent"
    }
  ]
}`;

      const response = await OpenRouterService.reason(
        userPrompt,
        systemPrompt,
        { event, context }
      );

      try {
        const dossierData = JSON.parse(response);
        return {
          eventId: event.id,
          agenda: dossierData.agenda || [],
          participants: event.participants?.map(p => ({
            id: p,
            name: p,
            availability: 'confirmed' as const
          })) || [],
          context: {
            relatedClient: context?.clientName ? { id: '', name: context.clientName } : undefined,
            relatedProject: context?.projectName ? { id: '', name: context.projectName } : undefined,
            relatedOpportunity: context?.opportunityName ? { id: '', name: context.opportunityName } : undefined
          },
          actionItems: dossierData.actionItems || [],
          notes: dossierData.notes || '',
          generatedAt: Timestamp.now()
        };
      } catch {
        // Fallback si no es JSON válido
        return {
          eventId: event.id,
          agenda: [],
          participants: [],
          context: {},
          notes: response,
          generatedAt: Timestamp.now()
        };
      }
    } catch (error) {
      logger.error('Failed to generate meeting dossier', error as Error);
      throw error;
    }
  }
}

