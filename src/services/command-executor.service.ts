/**
 * ZADIA OS - Command Executor Service
 * 
 * Execute commands from natural language
 * Rule #1: Real Firebase data only
 * Rule #4: Modular architecture
 */

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { CommandActionResult } from '@/types/command-bar.types';

export class CommandExecutorService {
  /**
   * Parse and execute command from natural language
   */
  static async executeCommand(
    input: string,
    userId: string
  ): Promise<CommandActionResult> {
    try {
      const normalized = input.toLowerCase().trim();

      // Detect command type
      if (normalized.startsWith('+tarea') || normalized.startsWith('+task')) {
        return await this.createTask(input, userId);
      }

      if (normalized.startsWith('+gasto') || normalized.startsWith('+expense')) {
        return await this.createExpense(input, userId);
      }

      if (normalized.startsWith('+reunión') || normalized.startsWith('+meeting')) {
        return await this.createMeeting(input, userId);
      }

      if (normalized.startsWith('+proyecto') || normalized.startsWith('+project')) {
        return await this.createProject(input, userId);
      }

      return {
        success: false,
        message: 'Comando no reconocido. Usa: +tarea, +gasto, +reunión, +proyecto',
      };
    } catch (error) {
      logger.error('Command execution failed', error as Error, {
        component: 'CommandExecutorService',
        metadata: { input }
      });

      return {
        success: false,
        message: 'Error al ejecutar comando',
      };
    }
  }

  /**
   * Create task from natural language
   * Example: "+tarea Llamar a Juan para el proyecto Cocina mañana @ana"
   */
  private static async createTask(
    input: string,
    userId: string
  ): Promise<CommandActionResult> {
    try {
      // Remove command prefix
      const content = input.replace(/^\+tarea\s+/i, '').replace(/^\+task\s+/i, '');

      // Extract assignee (@mention)
      const assigneeMatch = content.match(/@(\w+)/);
      const assignee = assigneeMatch ? assigneeMatch[1] : undefined;
      const contentWithoutAssignee = content.replace(/@\w+/g, '').trim();

      // Extract date keywords (mañana, hoy, próximo martes, etc.)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let dueDate = new Date();
      if (contentWithoutAssignee.includes('mañana')) {
        dueDate = tomorrow;
      }

      // Extract project reference
      const projectMatch = contentWithoutAssignee.match(/proyecto\s+['"]?([^'"]+)['"]?/i);
      const projectName = projectMatch ? projectMatch[1].trim() : undefined;

      // Clean title (remove extracted parts)
      const title = contentWithoutAssignee
        .replace(/mañana|hoy/gi, '')
        .replace(/proyecto\s+['"]?[^'"]+['"]?/gi, '')
        .trim();

      if (!title) {
        return {
          success: false,
          message: 'No se pudo extraer el título de la tarea',
        };
      }

      // Create task
      const taskData = {
        userId,
        title,
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: assignee || userId,
        projectName: projectName || null,
        dueDate: Timestamp.fromDate(dueDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'tasks'), taskData);

      return {
        success: true,
        message: `Tarea creada: "${title}"${assignee ? ` (asignada a @${assignee})` : ''}`,
        data: { taskId: docRef.id },
        redirectUrl: `/tasks/${docRef.id}`,
      };
    } catch (error) {
      logger.error('Task creation failed', error as Error);
      return {
        success: false,
        message: 'Error al crear tarea',
      };
    }
  }

  /**
   * Create expense from natural language
   * Example: "+gasto 50€ comida con cliente del proyecto Edificio Central"
   */
  private static async createExpense(
    input: string,
    userId: string
  ): Promise<CommandActionResult> {
    try {
      const content = input.replace(/^\+gasto\s+/i, '').replace(/^\+expense\s+/i, '');

      // Extract amount (50€, 50, $50, etc.)
      const amountMatch = content.match(/(\d+(?:\.\d{2})?)\s*€?/);
      if (!amountMatch) {
        return {
          success: false,
          message: 'No se pudo detectar el monto del gasto',
        };
      }

      const amount = parseFloat(amountMatch[1]);

      // Extract project reference
      const projectMatch = content.match(/proyecto\s+['"]?([^'"]+)['"]?/i);
      const projectName = projectMatch ? projectMatch[1].trim() : undefined;

      // Extract description
      let description = content
        .replace(/\d+(?:\.\d{2})?\s*€?/, '')
        .replace(/proyecto\s+['"]?[^'"]+['"]?/gi, '')
        .trim();

      if (!description) {
        description = 'Gasto sin descripción';
      }

      // Create expense
      const expenseData = {
        userId,
        amount,
        description,
        category: 'general',
        projectName: projectName || null,
        date: Timestamp.now(),
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'expenses'), expenseData);

      return {
        success: true,
        message: `Gasto registrado: ${amount}€ - ${description}`,
        data: { expenseId: docRef.id },
        redirectUrl: `/expenses/${docRef.id}`,
      };
    } catch (error) {
      logger.error('Expense creation failed', error as Error);
      return {
        success: false,
        message: 'Error al registrar gasto',
      };
    }
  }

  /**
   * Create meeting from natural language
   * Example: "+reunión Revisión de presupuesto con Ana el viernes a las 10am"
   */
  private static async createMeeting(
    input: string,
    userId: string
  ): Promise<CommandActionResult> {
    try {
      const content = input.replace(/^\+reunión\s+/i, '').replace(/^\+meeting\s+/i, '');

      // Extract participants (con X, con Y y Z)
      const participantsMatch = content.match(/con\s+([^0-9]+?)(?=\s+el|\s+mañ|\s+hoy|$)/i);
      const participants = participantsMatch 
        ? participantsMatch[1].split(/\s+y\s+|,\s*/).map(p => p.trim())
        : [];

      // Extract time (10am, 14:00, etc.)
      const timeMatch = content.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      let hour = 9;
      let minute = 0;

      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        if (timeMatch[3]?.toLowerCase() === 'pm' && hour < 12) {
          hour += 12;
        }
      }

      // Extract date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let meetingDate = new Date();
      if (content.includes('mañana')) {
        meetingDate = tomorrow;
      } else if (content.includes('viernes')) {
        // Find next Friday
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
        meetingDate.setDate(today.getDate() + daysUntilFriday);
      }

      meetingDate.setHours(hour, minute, 0, 0);

      // Extract title
      let title = content
        .replace(/con\s+.+?(?=\s+el|\s+mañ|\s+hoy)/gi, '')
        .replace(/el\s+(viernes|lunes|martes|miércoles|jueves|sábado|domingo)/gi, '')
        .replace(/mañana|hoy/gi, '')
        .replace(/a\s+las\s+\d{1,2}:?\d{0,2}\s*(am|pm)?/gi, '')
        .trim();

      if (!title) {
        title = 'Reunión sin título';
      }

      // Create meeting/event
      const meetingData = {
        userId,
        title,
        participants,
        startDate: Timestamp.fromDate(meetingDate),
        duration: 60, // Default 1 hour
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'events'), meetingData);

      return {
        success: true,
        message: `Reunión creada: "${title}" (${meetingDate.toLocaleString('es-ES')})`,
        data: { eventId: docRef.id },
        redirectUrl: `/calendar`,
      };
    } catch (error) {
      logger.error('Meeting creation failed', error as Error);
      return {
        success: false,
        message: 'Error al crear reunión',
      };
    }
  }

  /**
   * Create project from natural language
   */
  private static async createProject(
    input: string,
    userId: string
  ): Promise<CommandActionResult> {
    try {
      const content = input.replace(/^\+proyecto\s+/i, '').replace(/^\+project\s+/i, '');

      // Extract client (para X, para cliente Y)
      const clientMatch = content.match(/para\s+(cliente\s+)?['"]?([^'"]+)['"]?/i);
      const clientName = clientMatch ? clientMatch[2].trim() : undefined;

      // Extract title
      const title = content
        .replace(/para\s+(cliente\s+)?['"]?[^'"]+['"]?/gi, '')
        .trim();

      if (!title) {
        return {
          success: false,
          message: 'No se pudo extraer el nombre del proyecto',
        };
      }

      // Create project
      const projectData = {
        userId,
        name: title,
        description: '',
        clientName: clientName || null,
        status: 'planning',
        budget: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);

      return {
        success: true,
        message: `Proyecto creado: "${title}"${clientName ? ` para ${clientName}` : ''}`,
        data: { projectId: docRef.id },
        redirectUrl: `/projects/${docRef.id}`,
      };
    } catch (error) {
      logger.error('Project creation failed', error as Error);
      return {
        success: false,
        message: 'Error al crear proyecto',
      };
    }
  }
}
