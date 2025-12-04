/**
 * ZADIA OS - Project Entity Types
 * Tipos principales de la entidad Proyecto
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Estado del Proyecto
 */
export type ProjectStatus = 
  | 'planning'        // Planificación
  | 'in-progress'     // En Progreso
  | 'on-hold'         // En Espera
  | 'completed'       // Completado
  | 'cancelled';      // Cancelado

/**
 * Prioridad del Proyecto
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Proyecto - Entidad principal
 * Representa un proyecto ejecutable originado de una cotización aceptada
 */
export interface Project {
  id: string;
  
  // Información Básica
  name: string;
  description?: string;
  projectType: 'production' | 'service' | 'internal';
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Relaciones (origen del proyecto)
  clientId: string;
  clientName: string;
  opportunityId?: string;
  quoteId?: string;
  quoteNumber?: string;
  
  // Financiero
  salesPrice: number;              // Precio de venta (de la cotización)
  estimatedCost: number;           // Costo estimado
  actualCost: number;              // Costo real (acumulado)
  currency: string;
  paymentTerms?: string;
  
  // Fechas
  startDate?: Timestamp;
  estimatedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Equipo
  projectManager: string;          // UID del PM
  teamMembers: string[];           // UIDs del equipo
  
  // Progreso
  progressPercent: number;         // 0-100
  
  // BOM y Materiales
  bomId?: string;                  // Referencia al BOM
  materialsCost: number;           // Costo de materiales consumidos
  laborCost: number;               // Costo de mano de obra
  overheadCost: number;            // Gastos indirectos
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Datos para crear un proyecto
 */
export type CreateProjectData = Omit<
  Project,
  'id' | 'createdAt' | 'updatedAt' | 'actualCost' | 'materialsCost' | 'laborCost' | 'overheadCost' | 'progressPercent'
>;

/**
 * Datos para actualizar un proyecto
 */
export type UpdateProjectData = Partial<
  Omit<Project, 'id' | 'createdAt' | 'createdBy'>
>;

/**
 * Parámetros de búsqueda de proyectos
 */
export interface ProjectSearchParams {
  tenantId?: string;
  query?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  projectManager?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'name' | 'startDate' | 'status' | 'progressPercent' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  lastDoc?: unknown;
}

/**
 * KPIs del proyecto
 */
export interface ProjectKPIs {
  // Financiero
  budgetVariance: number;          // salesPrice - actualCost
  budgetVariancePercent: number;   // ((salesPrice - actualCost) / salesPrice) * 100
  profitMargin: number;            // ((salesPrice - actualCost) / salesPrice) * 100
  
  // Tiempo
  daysElapsed: number;
  daysRemaining: number;
  isDelayed: boolean;
  delayDays?: number;
  
  // Progreso
  progressPercent: number;
  completedTasks: number;
  totalTasks: number;
  completedWorkOrders: number;
  totalWorkOrders: number;
  
  // Costos desglosados
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
}
