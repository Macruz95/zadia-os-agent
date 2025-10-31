/**
 * ZADIA OS - AI Agent Tools Service
 *
 * Structured actions that the conversational assistant can execute.
 * Rule #3: Zod validation
 * Rule #4: Modular architecture
 */

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const toolSchema = z.enum(['create_task', 'create_expense', 'schedule_meeting', 'create_project']);

const baseInvocationSchema = z.object({
  tool: toolSchema,
  parameters: z.record(z.string(), z.unknown()).default({}),
  rationale: z.string().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(3, 'El título de la tarea es obligatorio'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  projectName: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const createExpenseSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  description: z.string().min(3, 'La descripción es obligatoria'),
  projectName: z.string().optional(),
  category: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
});

const scheduleMeetingSchema = z.object({
  title: z.string().min(3, 'El título es obligatorio'),
  scheduledFor: z.string().datetime(),
  durationMinutes: z.number().int().positive().optional(),
  participants: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  clientName: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().nonnegative().optional(),
});

export type AgentTool = z.infer<typeof toolSchema>;
export type AgentToolInvocation = z.infer<typeof baseInvocationSchema>;

export interface AgentToolExecutionResult {
  success: boolean;
  message: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export class AIAgentToolsService {
  static parseInvocation(raw: unknown): AgentToolInvocation | null {
    try {
      return baseInvocationSchema.parse(raw);
    } catch (error) {
      logger.warn('AI agent invocation descartado por formato inválido', {
        component: 'AIAgentToolsService',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return null;
    }
  }

  static async execute(invocation: AgentToolInvocation, userId: string): Promise<AgentToolExecutionResult> {
    switch (invocation.tool) {
      case 'create_task':
        return this.createTask(invocation.parameters, userId);
      case 'create_expense':
        return this.createExpense(invocation.parameters, userId);
      case 'schedule_meeting':
        return this.scheduleMeeting(invocation.parameters, userId);
      case 'create_project':
        return this.createProject(invocation.parameters, userId);
      default:
        return { success: false, message: 'Herramienta no soportada' };
    }
  }

  private static async createTask(params: Record<string, unknown>, userId: string): Promise<AgentToolExecutionResult> {
    const parsed = createTaskSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos para crear tarea' };
    }

    const data = parsed.data;
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

    const taskData: Record<string, unknown> = {
      userId,
      title: data.title,
      description: data.description ?? '',
      status: 'pending',
      priority: data.priority ?? 'medium',
      assignedTo: data.assigneeId ?? userId,
      projectName: data.projectName ?? null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (dueDate && !Number.isNaN(dueDate.getTime())) {
      taskData.dueDate = Timestamp.fromDate(dueDate);
    }

    const docRef = await addDoc(collection(db, 'tasks'), taskData);

    return {
      success: true,
      message: `✅ Tarea creada: "${data.title}"${data.projectName ? ` (proyecto: ${data.projectName})` : ''}`,
      redirectUrl: `/tasks/${docRef.id}`,
      metadata: { taskId: docRef.id },
    };
  }

  private static async createExpense(params: Record<string, unknown>, userId: string): Promise<AgentToolExecutionResult> {
    const parsed = createExpenseSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos para registrar gasto' };
    }

    const data = parsed.data;
    const occurredAt = data.occurredAt ? new Date(data.occurredAt) : undefined;

    const expenseData: Record<string, unknown> = {
      userId,
      amount: data.amount,
      description: data.description,
      category: data.category ?? 'general',
      projectName: data.projectName ?? null,
      createdAt: Timestamp.now(),
      date: Timestamp.now(),
    };

    if (occurredAt && !Number.isNaN(occurredAt.getTime())) {
      expenseData.date = Timestamp.fromDate(occurredAt);
    }

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);

    return {
      success: true,
      message: `💸 Gasto registrado: ${data.amount.toFixed(2)} - ${data.description}`,
      redirectUrl: `/expenses/${docRef.id}`,
      metadata: { expenseId: docRef.id },
    };
  }

  private static async scheduleMeeting(params: Record<string, unknown>, userId: string): Promise<AgentToolExecutionResult> {
    const parsed = scheduleMeetingSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos para agendar reunión' };
    }

    const data = parsed.data;
    const scheduledDate = new Date(data.scheduledFor);

    if (Number.isNaN(scheduledDate.getTime())) {
      return { success: false, message: 'Fecha de reunión inválida' };
    }

    const meetingData: Record<string, unknown> = {
      userId,
      title: data.title,
      participants: data.participants ?? [],
      startDate: Timestamp.fromDate(scheduledDate),
      duration: data.durationMinutes ?? 60,
      description: data.description ?? '',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'events'), meetingData);

    return {
      success: true,
      message: `📅 Reunión agendada: "${data.title}" el ${scheduledDate.toLocaleString('es-MX')}`,
      redirectUrl: `/calendar`,
      metadata: { eventId: docRef.id },
    };
  }

  private static async createProject(params: Record<string, unknown>, userId: string): Promise<AgentToolExecutionResult> {
    const parsed = createProjectSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Datos inválidos para crear proyecto' };
    }

    const data = parsed.data;

    const projectData: Record<string, unknown> = {
      userId,
      name: data.name,
      description: data.description ?? '',
      clientName: data.clientName ?? null,
      status: 'planning',
      budget: data.budget ?? 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);

    return {
      success: true,
      message: `🛠️ Proyecto creado: "${data.name}"${data.clientName ? ` para ${data.clientName}` : ''}`,
      redirectUrl: `/projects/${docRef.id}`,
      metadata: { projectId: docRef.id },
    };
  }
}
