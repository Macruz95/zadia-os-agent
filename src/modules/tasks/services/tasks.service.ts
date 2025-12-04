/**
 * ZADIA OS - Tasks Service
 * Servicio para gestión de tareas con scoring RICE-Z automático por IA
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
  Task, 
  RICEZScore,
  RICEScore,
  ZADIAScore,
  TaskAIInsights,
  DependencyAnalysis,
  TaskFilters
} from '../types/tasks.types';

export class TasksService {
  private static readonly COLLECTION = 'tasks';

  /**
   * Calcular score RICE-Z usando IA (DeepSeek R1)
   */
  static async calculateRICEZScore(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    context?: {
      relatedTasks?: Task[];
      businessMetrics?: Record<string, unknown>;
    }
  ): Promise<RICEZScore> {
    try {
      const systemPrompt = `Eres un experto en priorización de tareas empresariales de ZADIA OS.
Calcula scores RICE-Z (RICE + ZADIA) para tareas usando razonamiento profundo.
RICE: Reach (0-100), Impact (0-100), Confidence (0-100), Effort (0-100, inverso - menor es mejor)
ZADIA: StrategicValue (0-100), Urgency (0-100), Dependencies (0-100), ROI (0-100)
Usa razonamiento paso a paso para llegar a valores precisos.`;

      const userPrompt = `Calcula el score RICE-Z para esta tarea:

TAREA:
- Título: ${task.title}
- Descripción: ${task.description || 'N/A'}
- Dominio: ${task.domain}
- Prioridad actual: ${task.priority}
- Fecha límite: ${task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate.toDate().toISOString()) : 'N/A'}
- Horas estimadas: ${task.estimatedHours || 'N/A'}

CONTEXTO:
${context?.relatedTasks ? `- Tareas relacionadas: ${context.relatedTasks.length}` : ''}
${context?.businessMetrics ? `- Métricas del negocio disponibles` : ''}

Calcula cada componente del score RICE-Z con justificación.
Responde SOLO con JSON válido en este formato:
{
  "rice": {
    "reach": número 0-100,
    "impact": número 0-100,
    "confidence": número 0-100,
    "effort": número 0-100
  },
  "z": {
    "strategicValue": número 0-100,
    "urgency": número 0-100,
    "dependencies": número 0-100,
    "roi": número 0-100
  }
}`;

      const response = await OpenRouterService.reason(
        userPrompt,
        systemPrompt,
        { task, context }
      );

      try {
        const scores = JSON.parse(response) as { rice: RICEScore; z: ZADIAScore };
        
        // Calcular score total: (RICE promedio * 0.6) + (ZADIA promedio * 0.4)
        const riceAvg = (scores.rice.reach + scores.rice.impact + scores.rice.confidence + (100 - scores.rice.effort)) / 4;
        const zadiaAvg = (scores.z.strategicValue + scores.z.urgency + scores.z.dependencies + scores.z.roi) / 4;
        const total = (riceAvg * 0.6) + (zadiaAvg * 0.4);

        return {
          rice: scores.rice,
          z: scores.z,
          total,
          rank: 0, // Se calculará después
          calculatedAt: Timestamp.now()
        };
      } catch {
        // Fallback si no es JSON válido
        return {
          rice: { reach: 50, impact: 50, confidence: 50, effort: 50 },
          z: { strategicValue: 50, urgency: 50, dependencies: 50, roi: 50 },
          total: 50,
          rank: 0,
          calculatedAt: Timestamp.now()
        };
      }
    } catch (error) {
      logger.error('Failed to calculate RICE-Z score with AI', error as Error);
      // Retornar score por defecto
      return {
        rice: { reach: 50, impact: 50, confidence: 50, effort: 50 },
        z: { strategicValue: 50, urgency: 50, dependencies: 50, roi: 50 },
        total: 50,
        rank: 0,
        calculatedAt: Timestamp.now()
      };
    }
  }

  /**
   * Analizar dependencias con IA
   */
  static async analyzeDependencies(
    task: Task,
    allTasks: Task[]
  ): Promise<DependencyAnalysis> {
    try {
      const systemPrompt = `Eres un experto en análisis de dependencias de tareas de ZADIA OS.
Identifica el camino crítico, bloqueadores y riesgos de retraso.
Usa razonamiento profundo para analizar dependencias complejas.`;

      const userPrompt = `Analiza las dependencias de esta tarea:

TAREA:
- ID: ${task.id}
- Título: ${task.title}
- Dependencias: ${task.dependencies.map(d => d.taskId).join(', ') || 'Ninguna'}
- Bloquea: ${task.blocks.join(', ') || 'Ninguna'}

TODAS LAS TAREAS:
${allTasks.map(t => `- ${t.id}: ${t.title} (${t.status})`).join('\n')}

Identifica:
1. Camino crítico (tareas que deben completarse antes)
2. Tareas que bloquean esta
3. Tareas que esta bloquea
4. Retraso estimado si hay dependencias no completadas

Responde SOLO con JSON válido:
{
  "criticalPath": ["id1", "id2"],
  "blockers": ["id1"],
  "blockedBy": ["id2"],
  "estimatedDelay": número en días
}`;

      const response = await OpenRouterService.reason(
        userPrompt,
        systemPrompt,
        { task, allTasks }
      );

      try {
        return JSON.parse(response) as DependencyAnalysis;
      } catch {
        return {
          criticalPath: [],
          blockers: task.blocks,
          blockedBy: task.dependencies.filter(d => d.type === 'blocked-by').map(d => d.taskId),
          estimatedDelay: 0
        };
      }
    } catch (error) {
      logger.error('Failed to analyze dependencies', error as Error);
      return {
        criticalPath: [],
        blockers: task.blocks,
        blockedBy: task.dependencies.filter(d => d.type === 'blocked-by').map(d => d.taskId),
        estimatedDelay: 0
      };
    }
  }

  /**
   * Generar insights de IA para la tarea
   */
  static async generateAIInsights(
    task: Task,
    context?: {
      relatedTasks?: Task[];
      businessMetrics?: Record<string, unknown>;
    }
  ): Promise<TaskAIInsights> {
    try {
      const systemPrompt = `Eres un asistente de productividad experto de ZADIA OS.
Analiza tareas y proporciona insights accionables sobre prioridad, esfuerzo y riesgos.
Usa razonamiento profundo para dar recomendaciones precisas.`;

      const userPrompt = `Analiza esta tarea y proporciona insights:

TAREA:
- Título: ${task.title}
- Descripción: ${task.description || 'N/A'}
- Estado: ${task.status}
- Prioridad: ${task.priority}
- Dominio: ${task.domain}
- Fecha límite: ${task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate.toDate().toISOString()) : 'N/A'}
- Dependencias: ${task.dependencies.length}

Proporciona:
1. Prioridad sugerida
2. Fecha límite sugerida si no tiene
3. Factores de riesgo
4. Recomendaciones
5. Análisis de impacto
6. Análisis de dependencias

Responde SOLO con JSON válido:
{
  "suggestedPriority": "low|medium|high|urgent",
  "suggestedDueDate": "ISO date o null",
  "riskFactors": ["riesgo1", "riesgo2"],
  "recommendations": ["recomendación1", "recomendación2"],
  "estimatedEffort": número en horas,
  "impactAnalysis": "análisis de impacto",
  "dependenciesAnalysis": "análisis de dependencias"
}`;

      const response = await OpenRouterService.reason(
        userPrompt,
        systemPrompt,
        { task, context }
      );

      try {
        return JSON.parse(response) as TaskAIInsights;
      } catch {
        return {
          recommendations: [],
          riskFactors: []
        };
      }
    } catch (error) {
      logger.error('Failed to generate AI insights', error as Error);
      return {
        recommendations: [],
        riskFactors: []
      };
    }
  }

  /**
   * Crear tarea
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ricezScore'>,
    userId: string,
    tenantId?: string,
    autoScore: boolean = true
  ): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const taskData: Omit<Task, 'id'> = {
        ...task,
        userId,
        tenantId, // CRITICAL: Add tenant isolation
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        dependencies: task.dependencies || [],
        blocks: task.blocks || [],
        autoScored: false,
        dueDate: task.dueDate instanceof Date ? Timestamp.fromDate(task.dueDate) : task.dueDate,
        startDate: task.startDate instanceof Date ? Timestamp.fromDate(task.startDate) : task.startDate,
        ricezScore: autoScore ? await this.calculateRICEZScore(task, {}) : undefined,
      };

      if (autoScore && taskData.ricezScore) {
        (taskData as Task).autoScored = true;
      }

      const docRef = await addDoc(collection(db, this.COLLECTION), taskData);
      
      logger.info('Task created', {
        component: 'TasksService',
        metadata: { taskId: docRef.id, userId, autoScored: autoScore }
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create task', error as Error);
      throw error;
    }
  }

  /**
   * Obtener tarea por ID
   */
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      const docRef = doc(db, this.COLLECTION, taskId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Task;
    } catch (error) {
      logger.error('Failed to get task', error as Error);
      throw error;
    }
  }

  /**
   * Obtener tareas del usuario con filtros
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getTasks(
    userId: string,
    tenantId?: string,
    filters?: TaskFilters
  ): Promise<Task[]> {
    if (!tenantId) {
      return []; // Return empty if no tenant
    }
    
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where('tenantId', '==', tenantId), // CRITICAL: Filter by tenant first
        where('userId', '==', userId)
      ];

      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }

      if (filters?.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority));
      }

      if (filters?.domain && filters.domain.length > 0) {
        constraints.push(where('domain', 'in', filters.domain));
      }

      if (filters?.assignedTo) {
        constraints.push(where('assignedTo', '==', filters.assignedTo));
      }

      // Ordenamiento
      const sortBy = filters?.sortBy || 'ricezScore';
      const sortOrder = filters?.sortOrder || 'desc';

      if (sortBy === 'ricezScore') {
        constraints.push(orderBy('ricezScore.total', sortOrder));
      } else {
        constraints.push(orderBy(sortBy, sortOrder));
      }

      let tasks: Task[] = [];
      
      try {
        const q = query(collection(db, this.COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          } as Task);
        });
      } catch (indexError) {
        // Fallback: query without orderBy if index is not ready
        logger.warn('Index not ready, falling back to unordered query', {
          component: 'TasksService',
          metadata: { tenantId, userId, error: String(indexError) }
        });
        
        const basicConstraints: Parameters<typeof query>[1][] = [
          where('tenantId', '==', tenantId), // CRITICAL: Always filter by tenant
          where('userId', '==', userId)
        ];
        
        const q = query(collection(db, this.COLLECTION), ...basicConstraints);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          } as Task);
        });
        
        // Sort manually in memory
        tasks.sort((a, b) => {
          const aScore = a.ricezScore?.total || 0;
          const bScore = b.ricezScore?.total || 0;
          return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
        });
        
        // Apply filters manually if needed
        if (filters?.status && filters.status.length > 0) {
          tasks = tasks.filter(t => filters.status!.includes(t.status));
        }
        if (filters?.priority && filters.priority.length > 0) {
          tasks = tasks.filter(t => filters.priority!.includes(t.priority));
        }
        if (filters?.domain && filters.domain.length > 0) {
          tasks = tasks.filter(t => filters.domain!.includes(t.domain));
        }
      }

      // Filtrar por búsqueda si existe
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return tasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        );
      }

      return tasks;
    } catch (error) {
      logger.error('Failed to get tasks', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar tarea
   */
  static async updateTask(
    taskId: string,
    updates: Partial<Task>,
    recalculateScore: boolean = false
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, taskId);
      const updateData: Partial<Task> = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convertir fechas a Timestamp si es necesario
      if (updates.dueDate && updates.dueDate instanceof Date) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }
      if (updates.startDate && updates.startDate instanceof Date) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }

      // Recalcular score si es necesario
      if (recalculateScore) {
        const task = await this.getTask(taskId);
        if (task) {
          const score = await this.calculateRICEZScore(updates as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, {});
          updateData.ricezScore = score;
          updateData.autoScored = true;
        }
      }

      await updateDoc(docRef, updateData);
      
      logger.info('Task updated', {
        component: 'TasksService',
        metadata: { taskId, recalculatedScore: recalculateScore }
      });
    } catch (error) {
      logger.error('Failed to update task', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar tarea
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, taskId);
      await deleteDoc(docRef);
      
      logger.info('Task deleted', {
        component: 'TasksService',
        metadata: { taskId }
      });
    } catch (error) {
      logger.error('Failed to delete task', error as Error);
      throw error;
    }
  }

  /**
   * Recalcular rankings de todas las tareas
   */
  static async recalculateRankings(userId: string): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const sortedTasks = tasks
        .filter(t => t.ricezScore)
        .sort((a, b) => (b.ricezScore?.total || 0) - (a.ricezScore?.total || 0));

      // Actualizar rankings
      for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i];
        if (task.ricezScore) {
          await this.updateTask(task.id, {
            ricezScore: {
              ...task.ricezScore,
              rank: i + 1
            }
          });
        }
      }
    } catch (error) {
      logger.error('Failed to recalculate rankings', error as Error);
      throw error;
    }
  }
}

