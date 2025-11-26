/**
 * ZADIA OS - Tasks Types
 * Tipos para Gestor de Tareas RICE-Z
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Estado de la tarea
 */
export type TaskStatus = 
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'done'
  | 'cancelled';

/**
 * Prioridad de la tarea
 */
export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

/**
 * Dominio de la tarea (multi-dominio)
 */
export type TaskDomain = 
  | 'sales'
  | 'projects'
  | 'finance'
  | 'hr'
  | 'inventory'
  | 'general';

/**
 * Score RICE
 */
export interface RICEScore {
  reach: number;      // 0-100: Cuántas personas afecta
  impact: number;     // 0-100: Qué tan grande es el impacto
  confidence: number; // 0-100: Qué tan seguro estamos
  effort: number;     // 0-100: Cuánto esfuerzo requiere (inverso)
}

/**
 * Score ZADIA (factor estratégico)
 */
export interface ZADIAScore {
  strategicValue: number;    // 0-100: Valor estratégico para el negocio
  urgency: number;           // 0-100: Urgencia real
  dependencies: number;      // 0-100: Dependencias críticas
  roi: number;               // 0-100: Retorno de inversión estimado
}

/**
 * Score RICE-Z combinado
 */
export interface RICEZScore {
  rice: RICEScore;
  z: ZADIAScore;
  total: number;            // Score total calculado
  rank: number;              // Ranking entre todas las tareas
  calculatedAt: Timestamp | Date;
}

/**
 * Dependencia de tarea
 */
export interface TaskDependency {
  taskId: string;
  taskTitle: string;
  type: 'blocks' | 'blocked-by' | 'related';
  critical: boolean;
}

/**
 * Tarea
 */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  domain: TaskDomain;
  
  // RICE-Z Scoring
  ricezScore?: RICEZScore;
  autoScored: boolean; // Si fue calculado por IA
  
  // Fechas
  dueDate?: Timestamp | Date;
  startDate?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  
  // Dependencias multi-dominio
  dependencies: TaskDependency[];
  blocks: string[]; // IDs de tareas que bloquea
  
  // Asignación
  assignedTo?: string;
  assignedToName?: string;
  
  // Relaciones
  relatedClientId?: string;
  relatedProjectId?: string;
  relatedOpportunityId?: string;
  relatedInvoiceId?: string;
  
  // Metadata
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  
  // IA Insights
  aiInsights?: TaskAIInsights;
}

/**
 * Insights de IA para la tarea
 */
export interface TaskAIInsights {
  suggestedPriority?: TaskPriority;
  suggestedDueDate?: Date;
  riskFactors?: string[];
  recommendations?: string[];
  estimatedEffort?: number;
  impactAnalysis?: string;
  dependenciesAnalysis?: string;
}

/**
 * Análisis de dependencias
 */
export interface DependencyAnalysis {
  criticalPath: string[]; // IDs de tareas en el camino crítico
  blockers: string[];     // IDs de tareas que bloquean
  blockedBy: string[];   // IDs de tareas que bloquean esta
  estimatedDelay?: number; // Días de retraso estimado
}

/**
 * Filtros para tareas
 */
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  domain?: TaskDomain[];
  assignedTo?: string;
  search?: string;
  sortBy?: 'priority' | 'dueDate' | 'ricezScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

