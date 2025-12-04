/**
 * ZADIA OS - Tasks Hook
 * Hook personalizado para gestión de tareas
 * Rule #1: Real data from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { TasksService } from '../services/tasks.service';
import type { 
  Task, 
  RICEZScore,
  TaskAIInsights,
  DependencyAnalysis,
  TaskFilters
} from '../types/tasks.types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Operaciones CRUD
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ricezScore'>, autoScore?: boolean) => Promise<string>;
  updateTask: (taskId: string, updates: Partial<Task>, recalculateScore?: boolean) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Funciones de IA
  calculateScore: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ricezScore'>) => Promise<RICEZScore>;
  analyzeDependencies: (taskId: string) => Promise<DependencyAnalysis | null>;
  generateInsights: (taskId: string) => Promise<TaskAIInsights | null>;
  
  // Utilidades
  refreshTasks: () => Promise<void>;
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTopPriorityTasks: (limit?: number) => Task[];
}

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar tareas
   */
  const loadTasks = useCallback(async () => {
    if (!user?.uid || !tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const loadedTasks = await TasksService.getTasks(user.uid, tenantId, filters);
      setTasks(loadedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(errorMessage);
      logger.error('Failed to load tasks', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, tenantId, filters]);

  /**
   * Crear tarea
   */
  const createTask = useCallback(async (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ricezScore'>,
    autoScore: boolean = true
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }
    if (!tenantId) {
      throw new Error('No tenant ID');
    }

    try {
      const taskId = await TasksService.createTask(task, user.uid, tenantId, autoScore);
      await loadTasks(); // Recargar tareas
      return taskId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tarea';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid, tenantId, loadTasks]);

  /**
   * Actualizar tarea
   */
  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Task>,
    recalculateScore: boolean = false
  ): Promise<void> => {
    try {
      await TasksService.updateTask(taskId, updates, recalculateScore);
      await loadTasks(); // Recargar tareas
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarea';
      setError(errorMessage);
      throw err;
    }
  }, [loadTasks]);

  /**
   * Eliminar tarea
   */
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      await TasksService.deleteTask(taskId);
      await loadTasks(); // Recargar tareas
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarea';
      setError(errorMessage);
      throw err;
    }
  }, [loadTasks]);

  /**
   * Calcular score RICE-Z
   */
  const calculateScore = useCallback(async (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'ricezScore'>
  ): Promise<RICEZScore> => {
    try {
      const score = await TasksService.calculateRICEZScore(task, {});
      return score;
    } catch (err) {
      logger.error('Failed to calculate score', err as Error);
      throw err;
    }
  }, []);

  /**
   * Analizar dependencias
   */
  const analyzeDependencies = useCallback(async (
    taskId: string
  ): Promise<DependencyAnalysis | null> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return null;
      }

      const analysis = await TasksService.analyzeDependencies(task, tasks);
      return analysis;
    } catch (err) {
      logger.error('Failed to analyze dependencies', err as Error);
      return null;
    }
  }, [tasks]);

  /**
   * Generar insights de IA
   */
  const generateInsights = useCallback(async (
    taskId: string
  ): Promise<TaskAIInsights | null> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return null;
      }

      const insights = await TasksService.generateAIInsights(task, {});
      return insights;
    } catch (err) {
      logger.error('Failed to generate insights', err as Error);
      return null;
    }
  }, [tasks]);

  /**
   * Obtener tareas por estado
   */
  const getTasksByStatus = useCallback((status: Task['status']): Task[] => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  /**
   * Obtener tareas por prioridad
   */
  const getTasksByPriority = useCallback((priority: Task['priority']): Task[] => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  /**
   * Obtener tareas de mayor prioridad (top N)
   */
  const getTopPriorityTasks = useCallback((limitCount: number = 10): Task[] => {
    return tasks
      .filter(task => task.ricezScore)
      .sort((a, b) => (b.ricezScore?.total || 0) - (a.ricezScore?.total || 0))
      .slice(0, limitCount);
  }, [tasks]);

  /**
   * Refrescar tareas
   */
  const refreshTasks = useCallback(async (): Promise<void> => {
    await loadTasks();
  }, [loadTasks]);

  // Cargar tareas al montar
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    calculateScore,
    analyzeDependencies,
    generateInsights,
    refreshTasks,
    getTasksByStatus,
    getTasksByPriority,
    getTopPriorityTasks
  };
}

