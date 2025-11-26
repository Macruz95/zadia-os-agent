/**
 * ZADIA OS - Workflows Hook
 * Hook personalizado para gestión de flujos cognitivos
 * Rule #1: Real data from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { WorkflowsService } from '../services/workflows.service';
import type { 
  Workflow, 
  WorkflowExecution,
  WorkflowTemplate
} from '../types/workflows.types';

interface UseWorkflowsReturn {
  workflows: Workflow[];
  loading: boolean;
  error: string | null;
  
  // Operaciones CRUD
  createFromTemplate: (template: WorkflowTemplate, customizations?: Partial<Workflow>) => Promise<string>;
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'>) => Promise<string>;
  updateWorkflow: (workflowId: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  
  // Ejecución
  executeWorkflow: (workflowId: string, context?: Record<string, unknown>) => Promise<string>;
  
  // Historial
  getExecutions: (workflowId?: string) => Promise<WorkflowExecution[]>;
  
  // Utilidades
  refreshWorkflows: () => Promise<void>;
  getWorkflowById: (workflowId: string) => Promise<Workflow | null>;
}

export function useWorkflows(): UseWorkflowsReturn {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar flujos
   */
  const loadWorkflows = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const loadedWorkflows = await WorkflowsService.getWorkflows(user.uid);
      setWorkflows(loadedWorkflows);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar flujos';
      setError(errorMessage);
      logger.error('Failed to load workflows', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * Crear desde template
   */
  const createFromTemplate = useCallback(async (
    template: WorkflowTemplate,
    customizations?: Partial<Workflow>
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const workflowId = await WorkflowsService.createFromTemplate(template, user.uid, customizations);
      await loadWorkflows();
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear flujo';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid, loadWorkflows]);

  /**
   * Crear flujo personalizado
   */
  const createWorkflow = useCallback(async (
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'>
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const workflowId = await WorkflowsService.createWorkflow(workflow, user.uid);
      await loadWorkflows();
      return workflowId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear flujo';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid, loadWorkflows]);

  /**
   * Actualizar flujo
   */
  const updateWorkflow = useCallback(async (
    workflowId: string,
    updates: Partial<Workflow>
  ): Promise<void> => {
    try {
      await WorkflowsService.updateWorkflow(workflowId, updates);
      await loadWorkflows();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar flujo';
      setError(errorMessage);
      throw err;
    }
  }, [loadWorkflows]);

  /**
   * Eliminar flujo
   */
  const deleteWorkflow = useCallback(async (workflowId: string): Promise<void> => {
    try {
      await WorkflowsService.deleteWorkflow(workflowId);
      await loadWorkflows();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar flujo';
      setError(errorMessage);
      throw err;
    }
  }, [loadWorkflows]);

  /**
   * Ejecutar flujo
   */
  const executeWorkflow = useCallback(async (
    workflowId: string,
    context: Record<string, unknown> = {}
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const executionId = await WorkflowsService.executeWorkflow(workflowId, user.uid, context);
      return executionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar flujo';
      setError(errorMessage);
      throw err;
    }
  }, [user?.uid]);

  /**
   * Obtener ejecuciones
   */
  const getExecutions = useCallback(async (
    workflowId?: string
  ): Promise<WorkflowExecution[]> => {
    if (!user?.uid) {
      return [];
    }

    try {
      return await WorkflowsService.getExecutions(user.uid, workflowId);
    } catch (err) {
      logger.error('Failed to get executions', err as Error);
      return [];
    }
  }, [user?.uid]);

  /**
   * Obtener flujo por ID
   */
  const getWorkflowById = useCallback(async (workflowId: string): Promise<Workflow | null> => {
    try {
      return await WorkflowsService.getWorkflow(workflowId);
    } catch (err) {
      logger.error('Failed to get workflow', err as Error);
      return null;
    }
  }, []);

  /**
   * Refrescar flujos
   */
  const refreshWorkflows = useCallback(async (): Promise<void> => {
    await loadWorkflows();
  }, [loadWorkflows]);

  // Cargar flujos al montar
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  return {
    workflows,
    loading,
    error,
    createFromTemplate,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    getExecutions,
    refreshWorkflows,
    getWorkflowById
  };
}

