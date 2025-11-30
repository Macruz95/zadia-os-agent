/**
 * ZADIA OS - Project Actions Hook
 * 
 * Integra acciones de proyectos con el Event Bus central
 * Cada acción emite eventos que los agentes procesan automáticamente
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

interface ProjectData {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  managerId?: string;
  managerName?: string;
}

interface TaskData {
  id?: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

interface MilestoneData {
  id?: string;
  projectId: string;
  projectName: string;
  name: string;
  dueDate: string;
  completed?: boolean;
}

export function useProjectActions() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREAR PROYECTO
  // ═══════════════════════════════════════════════════════════════════════
  const createProject = useCallback(async (data: Omit<ProjectData, 'id'> & { id?: string }) => {
    const projectId = data.id || `project-${Date.now()}`;
    
    await EventBus.emit('project:created', {
      projectId,
      projectName: data.name,
      clientId: data.clientId,
      clientName: data.clientName,
      status: data.status || 'planning',
      priority: data.priority || 'medium',
      budget: data.budget,
      startDate: data.startDate,
      endDate: data.endDate
    }, { source: 'projects-module' });

    logger.info('✅ Project created', { projectId, name: data.name });
    return projectId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR PROYECTO
  // ═══════════════════════════════════════════════════════════════════════
  const updateProject = useCallback(async (projectId: string, data: Partial<ProjectData>) => {
    await EventBus.emit('project:updated', {
      projectId,
      projectName: data.name,
      changes: data
    }, { source: 'projects-module' });

    logger.info('✅ Project updated', { projectId });
    return projectId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CAMBIO DE ESTADO
  // ═══════════════════════════════════════════════════════════════════════
  const startProject = useCallback(async (projectId: string, projectName: string) => {
    await EventBus.emit('project:started', {
      projectId,
      projectName,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('🚀 Project started', { projectId });
  }, []);

  const pauseProject = useCallback(async (projectId: string, projectName: string, reason?: string) => {
    await EventBus.emit('project:paused', {
      projectId,
      projectName,
      status: 'on_hold',
      reason,
      pausedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('⏸️ Project paused', { projectId, reason });
  }, []);

  const completeProject = useCallback(async (projectId: string, projectName: string, clientId: string) => {
    await EventBus.emit('project:completed', {
      projectId,
      projectName,
      clientId,
      status: 'completed',
      completedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('✅ Project completed', { projectId });
  }, []);

  const cancelProject = useCallback(async (projectId: string, projectName: string, reason: string) => {
    await EventBus.emit('project:cancelled', {
      projectId,
      projectName,
      status: 'cancelled',
      reason,
      cancelledAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('❌ Project cancelled', { projectId, reason });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // PROGRESO
  // ═══════════════════════════════════════════════════════════════════════
  const updateProgress = useCallback(async (
    projectId: string, 
    projectName: string, 
    progress: number
  ) => {
    await EventBus.emit('project:progress_updated', {
      projectId,
      projectName,
      progress,
      updatedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('📊 Project progress updated', { projectId, progress });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // TAREAS
  // ═══════════════════════════════════════════════════════════════════════
  const addTask = useCallback(async (data: TaskData) => {
    const taskId = data.id || `task-${Date.now()}`;
    
    await EventBus.emit('project:task_added', {
      taskId,
      projectId: data.projectId,
      projectName: data.projectName,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      dueDate: data.dueDate
    }, { source: 'projects-module' });

    logger.info('✅ Task added to project', { taskId, projectId: data.projectId });
    return taskId;
  }, []);

  const completeTask = useCallback(async (
    taskId: string, 
    projectId: string, 
    projectName: string
  ) => {
    await EventBus.emit('project:task_completed', {
      taskId,
      projectId,
      projectName,
      completedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('✅ Task completed', { taskId, projectId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // HITOS (MILESTONES)
  // ═══════════════════════════════════════════════════════════════════════
  const addMilestone = useCallback(async (data: MilestoneData) => {
    const milestoneId = data.id || `milestone-${Date.now()}`;
    
    await EventBus.emit('project:milestone_added', {
      milestoneId,
      projectId: data.projectId,
      projectName: data.projectName,
      name: data.name,
      dueDate: data.dueDate
    }, { source: 'projects-module' });

    logger.info('🎯 Milestone added', { milestoneId, projectId: data.projectId });
    return milestoneId;
  }, []);

  const completeMilestone = useCallback(async (
    milestoneId: string,
    projectId: string,
    projectName: string,
    milestoneName: string
  ) => {
    await EventBus.emit('project:milestone_completed', {
      milestoneId,
      projectId,
      projectName,
      milestoneName,
      completedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.info('✅ Milestone completed', { milestoneId, projectId });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ALERTAS
  // ═══════════════════════════════════════════════════════════════════════
  const reportDelay = useCallback(async (
    projectId: string,
    projectName: string,
    daysDelayed: number,
    reason?: string
  ) => {
    await EventBus.emit('project:delayed', {
      projectId,
      projectName,
      daysDelayed,
      reason,
      reportedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.warn('⚠️ Project delay reported', { projectId, daysDelayed });
  }, []);

  const reportBudgetOverrun = useCallback(async (
    projectId: string,
    projectName: string,
    budgetUsed: number,
    budgetTotal: number
  ) => {
    const overrunPercent = ((budgetUsed - budgetTotal) / budgetTotal) * 100;
    
    await EventBus.emit('project:budget_overrun', {
      projectId,
      projectName,
      budgetUsed,
      budgetTotal,
      overrunPercent,
      reportedAt: new Date().toISOString()
    }, { source: 'projects-module' });

    logger.warn('💰 Budget overrun reported', { projectId, overrunPercent });
  }, []);

  return {
    // CRUD
    createProject,
    updateProject,
    
    // Estado
    startProject,
    pauseProject,
    completeProject,
    cancelProject,
    
    // Progreso
    updateProgress,
    
    // Tareas
    addTask,
    completeTask,
    
    // Hitos
    addMilestone,
    completeMilestone,
    
    // Alertas
    reportDelay,
    reportBudgetOverrun
  };
}
