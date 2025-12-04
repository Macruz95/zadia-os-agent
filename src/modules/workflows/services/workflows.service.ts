/**
 * ZADIA OS - Workflows Service
 * Servicio para gestión de flujos cognitivos
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
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { OpenRouterService } from '@/lib/ai/openrouter.service';
import { workflowTemplates } from '../templates';
import type { 
  Workflow, 
  WorkflowExecution,
  WorkflowTemplate
} from '../types/workflows.types';

export class WorkflowsService {
  private static readonly COLLECTION = 'workflows';
  private static readonly EXECUTIONS_COLLECTION = 'workflow-executions';

  /**
   * Crear flujo desde template
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createFromTemplate(
    template: WorkflowTemplate,
    userId: string,
    tenantId?: string,
    customizations?: Partial<Workflow>
  ): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const baseTemplate = workflowTemplates[template];
      if (!baseTemplate) {
        throw new Error(`Template ${template} no encontrado`);
      }

      const workflowData: Omit<Workflow, 'id'> = {
        ...baseTemplate,
        ...customizations,
        userId,
        tenantId, // CRITICAL: Add tenant isolation
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        executionCount: 0
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), workflowData);
      
      logger.info('Workflow created from template', {
        component: 'WorkflowsService',
        metadata: { workflowId: docRef.id, template, userId }
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create workflow from template', error as Error);
      throw error;
    }
  }

  /**
   * Crear flujo personalizado
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createWorkflow(
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'>,
    userId: string,
    tenantId?: string
  ): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const workflowData: Omit<Workflow, 'id'> = {
        ...workflow,
        userId,
        tenantId, // CRITICAL: Add tenant isolation
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        executionCount: 0
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), workflowData);
      
      logger.info('Workflow created', {
        component: 'WorkflowsService',
        metadata: { workflowId: docRef.id, userId }
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create workflow', error as Error);
      throw error;
    }
  }

  /**
   * Obtener flujo por ID
   */
  static async getWorkflow(workflowId: string): Promise<Workflow | null> {
    try {
      const docRef = doc(db, this.COLLECTION, workflowId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Workflow;
    } catch (error) {
      logger.error('Failed to get workflow', error as Error);
      throw error;
    }
  }

  /**
   * Obtener flujos del usuario
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getWorkflows(
    userId: string,
    tenantId?: string,
    filters?: {
      status?: Workflow['status'][];
      template?: WorkflowTemplate[];
    }
  ): Promise<Workflow[]> {
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

      if (filters?.template && filters.template.length > 0) {
        constraints.push(where('template', 'in', filters.template));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, this.COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      const workflows: Workflow[] = [];

      querySnapshot.forEach((doc) => {
        workflows.push({
          id: doc.id,
          ...doc.data()
        } as Workflow);
      });

      return workflows;
    } catch (error) {
      logger.error('Failed to get workflows', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar flujo
   */
  static async updateWorkflow(
    workflowId: string,
    updates: Partial<Workflow>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, workflowId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
      
      logger.info('Workflow updated', {
        component: 'WorkflowsService',
        metadata: { workflowId }
      });
    } catch (error) {
      logger.error('Failed to update workflow', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar flujo
   */
  static async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, workflowId);
      await deleteDoc(docRef);
      
      logger.info('Workflow deleted', {
        component: 'WorkflowsService',
        metadata: { workflowId }
      });
    } catch (error) {
      logger.error('Failed to delete workflow', error as Error);
      throw error;
    }
  }

  /**
   * Ejecutar flujo
   * Usa Qwen3-Coder para ejecución de agentes complejos
   * @param tenantId - Required tenant ID for data isolation
   */
  static async executeWorkflow(
    workflowId: string,
    userId: string,
    tenantId?: string,
    context: Record<string, unknown> = {}
  ): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('Workflow no encontrado');
      }

      // Crear ejecución
      const execution: Omit<WorkflowExecution, 'id'> = {
        userId,
        tenantId, // CRITICAL: Add tenant isolation
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        startedAt: Timestamp.now(),
        context,
        executedSteps: [],
        triggeredBy: 'user',
        createdAt: Timestamp.now()
      };

      const execRef = await addDoc(collection(db, this.EXECUTIONS_COLLECTION), execution);

      // Ejecutar flujo usando IA (Qwen3-Coder para agentes)
      const systemPrompt = `Eres un ejecutor de flujos cognitivos de ZADIA OS.
Ejecuta los pasos del flujo de manera secuencial, tomando decisiones inteligentes cuando sea necesario.
Usa razonamiento paso a paso para completar cada acción.`;

      const userPrompt = `Ejecuta este flujo cognitivo:

FLUJO: ${workflow.name}
DESCRIPCIÓN: ${workflow.description || 'N/A'}

PASOS:
${workflow.steps.map(s => `- ${s.name} (${s.type}): ${s.description || ''}`).join('\n')}

CONTEXTO:
${JSON.stringify(context, null, 2)}

Ejecuta cada paso en orden y proporciona el resultado de cada uno.
Responde en formato JSON:
{
  "steps": [
    {
      "stepId": "id",
      "status": "completed|failed",
      "result": {},
      "duration": número en segundos
    }
  ],
  "finalStatus": "completed|failed",
  "result": {}
}`;

      const response = await OpenRouterService.agenticTask(
        userPrompt,
        systemPrompt
      );

      try {
        const executionResult = JSON.parse(response);
        
        // Actualizar ejecución
        const completedAt = Timestamp.now();
        const startTime = execution.startedAt instanceof Timestamp 
          ? execution.startedAt.toMillis() 
          : execution.startedAt.getTime();
        const duration = Math.round((completedAt.toMillis() - startTime) / 1000);

        await updateDoc(execRef, {
          status: executionResult.finalStatus || 'completed',
          completedAt,
          duration,
          executedSteps: executionResult.steps || [],
          result: executionResult.result || {},
          currentStepId: undefined
        });

        // Actualizar contador de ejecuciones del flujo
        await updateDoc(doc(db, this.COLLECTION, workflowId), {
          executionCount: (workflow.executionCount || 0) + 1,
          lastExecutedAt: completedAt
        });

        return execRef.id;
      } catch {
        // Si no es JSON válido, marcar como completado con el texto como resultado
        await updateDoc(execRef, {
          status: 'completed',
          completedAt: Timestamp.now(),
          result: {
            success: true,
            message: response
          }
        });

        return execRef.id;
      }
    } catch (error) {
      logger.error('Failed to execute workflow', error as Error);
      throw error;
    }
  }

  /**
   * Obtener ejecuciones de un flujo
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getExecutions(
    userId: string,
    tenantId?: string,
    workflowId?: string
  ): Promise<WorkflowExecution[]> {
    if (!tenantId) {
      return []; // Return empty if no tenant
    }
    
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where('tenantId', '==', tenantId), // CRITICAL: Filter by tenant first
        where('userId', '==', userId)
      ];

      if (workflowId) {
        constraints.push(where('workflowId', '==', workflowId));
      }

      constraints.push(orderBy('startedAt', 'desc'));
      constraints.push(limit(50));

      const q = query(collection(db, this.EXECUTIONS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      const executions: WorkflowExecution[] = [];

      querySnapshot.forEach((doc) => {
        executions.push({
          id: doc.id,
          ...doc.data()
        } as WorkflowExecution);
      });

      return executions;
    } catch (error) {
      logger.error('Failed to get executions', error as Error);
      throw error;
    }
  }

  /**
   * Obtener ejecución por ID
   */
  static async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const docRef = doc(db, this.EXECUTIONS_COLLECTION, executionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as WorkflowExecution;
    } catch (error) {
      logger.error('Failed to get execution', error as Error);
      throw error;
    }
  }
}

