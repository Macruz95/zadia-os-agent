/**
 * ZADIA OS - Command AI Service
 * 
 * Process natural language questions and query DTO
 * Rule #1: Real Firebase data only
 * Rule #4: Modular architecture
 */

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { OpenRouterService } from '@/lib/ai/openrouter.service';
import type { QuestionResponse } from '@/types/command-bar.types';

export class CommandAIService {
  /**
   * Process natural language question
   */
  static async processQuestion(
    question: string,
    userId: string
  ): Promise<QuestionResponse> {
    try {
      const normalized = question.toLowerCase().trim();

      // Simple queries (direct DTO lookup)
      if (this.isSimpleContactQuery(normalized)) {
        return await this.answerContactQuery(question, userId);
      }

      if (this.isSimpleMetricQuery(normalized)) {
        return await this.answerMetricQuery(question, userId);
      }

      // Complex queries (AI analysis)
      return await this.answerComplexQuery(question, userId);
    } catch (error) {
      logger.error('Question processing failed', error as Error, {
        component: 'CommandAIService',
        metadata: { question }
      });

      return {
        type: 'text',
        answer: 'No pude procesar tu pregunta. Intenta reformularla.',
        confidence: 0,
      };
    }
  }

  /**
   * Check if simple contact query (phone, email)
   */
  private static isSimpleContactQuery(question: string): boolean {
    return (
      (question.includes('teléfono') || question.includes('telefono') || question.includes('phone')) ||
      (question.includes('email') || question.includes('correo'))
    );
  }

  /**
   * Check if simple metric query
   */
  private static isSimpleMetricQuery(question: string): boolean {
    return (
      question.includes('cuántos') || question.includes('cuantos') ||
      question.includes('total de') || question.includes('suma de')
    );
  }

  /**
   * Answer contact queries
   * Example: "¿Cuál es el teléfono de Ana López?"
   */
  private static async answerContactQuery(
    question: string,
    userId: string
  ): Promise<QuestionResponse> {
    try {
      // Extract name from question
      const nameMatch = question.match(/de\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s+[A-ZÁ-Ú][a-zá-ú]+)*)/);
      if (!nameMatch) {
        return {
          type: 'text',
          answer: 'No pude identificar el nombre en tu pregunta.',
          confidence: 0,
        };
      }

      const searchName = nameMatch[1].toLowerCase();

      // Search in clients
      const clientsQuery = query(
        collection(db, 'clients'),
        where('userId', '==', userId),
        limit(10)
      );

      const snapshot = await getDocs(clientsQuery);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const clientName = data.name?.toLowerCase() || '';
        
        if (clientName.includes(searchName)) {
          if (question.includes('teléfono') || question.includes('telefono') || question.includes('phone')) {
            return {
              type: 'text',
              answer: data.phone || 'No hay teléfono registrado',
              confidence: 1,
            };
          }
          
          if (question.includes('email') || question.includes('correo')) {
            return {
              type: 'text',
              answer: data.email || 'No hay email registrado',
              confidence: 1,
            };
          }
        }
      }

      return {
        type: 'text',
        answer: `No encontré información de contacto para "${nameMatch[1]}"`,
        confidence: 0,
      };
    } catch (error) {
      logger.error('Contact query failed', error as Error);
      return {
        type: 'text',
        answer: 'Error al buscar información de contacto',
        confidence: 0,
      };
    }
  }

  /**
   * Answer metric queries
   * Example: "¿Cuántos proyectos activos tengo?"
   */
  private static async answerMetricQuery(
    question: string,
    userId: string
  ): Promise<QuestionResponse> {
    try {
      const normalized = question.toLowerCase();

      // Count active projects
      if (normalized.includes('proyecto') && (normalized.includes('activo') || normalized.includes('en curso'))) {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', userId),
          where('status', '==', 'in_progress')
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size;

        return {
          type: 'number',
          answer: `Tienes ${count} proyecto${count !== 1 ? 's' : ''} activo${count !== 1 ? 's' : ''}`,
          data: count,
          confidence: 1,
        };
      }

      // Count clients
      if (normalized.includes('cliente')) {
        const q = query(
          collection(db, 'clients'),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size;

        return {
          type: 'number',
          answer: `Tienes ${count} cliente${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}`,
          data: count,
          confidence: 1,
        };
      }

      // Count pending invoices
      if (normalized.includes('factura') && normalized.includes('pendiente')) {
        const q = query(
          collection(db, 'invoices'),
          where('userId', '==', userId),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size;

        return {
          type: 'number',
          answer: `Tienes ${count} factura${count !== 1 ? 's' : ''} pendiente${count !== 1 ? 's' : ''}`,
          data: count,
          confidence: 1,
        };
      }

      return {
        type: 'text',
        answer: 'No pude identificar qué métrica quieres consultar.',
        confidence: 0,
      };
    } catch (error) {
      logger.error('Metric query failed', error as Error);
      return {
        type: 'text',
        answer: 'Error al consultar métrica',
        confidence: 0,
      };
    }
  }

  /**
   * Answer complex queries using AI
   * Example: "¿Qué proyectos están sobre presupuesto y retrasados?"
   */
  private static async answerComplexQuery(
    question: string,
    userId: string
  ): Promise<QuestionResponse> {
    try {
      // Fetch relevant data from DTO
      const [projects, invoices, clients] = await Promise.all([
        this.fetchProjects(userId),
        this.fetchInvoices(userId),
        this.fetchClients(userId),
      ]);

      // Build context for AI
      const context = {
        projects: projects.slice(0, 20), // Limit for token efficiency
        invoices: invoices.slice(0, 20),
        clients: clients.slice(0, 20),
      };

      // Ask AI
      const prompt = `Eres el asistente de ZADIA OS. Analiza los datos del negocio y responde la pregunta de forma concisa.

DATOS DEL NEGOCIO:
${JSON.stringify(context, null, 2)}

PREGUNTA DEL USUARIO:
${question}

Responde de forma directa y concisa en español. Si la pregunta requiere cálculos o análisis, hazlos. Si no hay datos suficientes, dilo claramente.`;

      const response = await OpenRouterService.ask(prompt);

      return {
        type: 'text',
        answer: response,
        data: context,
        confidence: 0.8,
      };
    } catch (error) {
      logger.error('Complex query failed', error as Error);
      return {
        type: 'text',
        answer: 'Error al procesar la consulta compleja',
        confidence: 0,
      };
    }
  }

  /**
   * Fetch projects for AI context
   */
  private static async fetchProjects(userId: string) {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Fetch invoices for AI context
   */
  private static async fetchInvoices(userId: string) {
    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Fetch clients for AI context
   */
  private static async fetchClients(userId: string) {
    const q = query(
      collection(db, 'clients'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
