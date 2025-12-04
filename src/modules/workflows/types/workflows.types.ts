/**
 * ZADIA OS - Workflows Types
 * Tipos para Biblioteca de Flujos Cognitivos
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Tipo de template de flujo
 */
export type WorkflowTemplate = 
  | 'onboarding-client'
  | 'invoice-reminder'
  | 'project-kickoff'
  | 'custom';

/**
 * Estado del flujo
 */
export type WorkflowStatus = 
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

/**
 * Estado de ejecución
 */
export type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Tipo de paso en el flujo
 */
export type StepType = 
  | 'action'
  | 'condition'
  | 'delay'
  | 'notification'
  | 'data-fetch'
  | 'ai-decision';

/**
 * Paso del flujo
 */
export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description?: string;
  order: number;
  
  // Configuración del paso
  config: Record<string, unknown>;
  
  // Condiciones (para steps tipo 'condition')
  conditions?: StepCondition[];
  
  // Siguiente paso
  nextStepId?: string;
  onSuccessStepId?: string;
  onFailureStepId?: string;
}

/**
 * Condición de paso
 */
export interface StepCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'exists';
  value: unknown;
}

/**
 * Flujo cognitivo
 */
export interface Workflow {
  id: string;
  tenantId?: string; // For tenant isolation
  userId: string;
  name: string;
  description?: string;
  template: WorkflowTemplate;
  status: WorkflowStatus;
  
  // Pasos del flujo
  steps: WorkflowStep[];
  startStepId: string;
  
  // Configuración
  config: WorkflowConfig;
  
  // Triggers (cuándo se ejecuta)
  triggers: WorkflowTrigger[];
  
  // Metadata
  tags?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  
  // Estadísticas
  executionCount?: number;
  lastExecutedAt?: Timestamp | Date;
}

/**
 * Configuración del flujo
 */
export interface WorkflowConfig {
  autoStart?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  timeout?: number; // segundos
  notifications?: {
    onStart?: boolean;
    onComplete?: boolean;
    onFailure?: boolean;
  };
}

/**
 * Trigger del flujo
 */
export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'condition';
  config: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Ejecución del flujo
 */
export interface WorkflowExecution {
  id: string;
  tenantId?: string; // For tenant isolation
  userId: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  
  // Tiempos
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  duration?: number; // segundos
  
  // Contexto
  context: Record<string, unknown>;
  
  // Pasos ejecutados
  executedSteps: ExecutedStep[];
  currentStepId?: string;
  
  // Resultado
  result?: ExecutionResult;
  error?: ExecutionError;
  
  // Metadata
  triggeredBy?: 'user' | 'system' | 'schedule' | 'event';
  triggeredById?: string;
  createdAt: Timestamp | Date;
}

/**
 * Paso ejecutado
 */
export interface ExecutedStep {
  stepId: string;
  stepName: string;
  status: ExecutionStatus;
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  duration?: number;
  result?: Record<string, unknown>;
  error?: string;
}

/**
 * Resultado de ejecución
 */
export interface ExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  actionsTaken?: string[];
}

/**
 * Error de ejecución
 */
export interface ExecutionError {
  message: string;
  stepId?: string;
  stepName?: string;
  stack?: string;
  retryable: boolean;
}

