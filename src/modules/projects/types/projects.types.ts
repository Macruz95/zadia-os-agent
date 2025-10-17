// src/modules/projects/types/projects.types.ts

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
 * Estado de Orden de Trabajo
 */
export type WorkOrderStatus = 
  | 'pending'         // Pendiente
  | 'in-progress'     // En Proceso
  | 'paused'          // Pausado
  | 'completed'       // Completado
  | 'cancelled';      // Cancelado

/**
 * Estado de Tarea
 */
export type TaskStatus = 
  | 'todo'            // Por Hacer
  | 'in-progress'     // En Progreso
  | 'review'          // En Revisión
  | 'done'            // Completada
  | 'cancelled';      // Cancelada

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
 * Material usado en Orden de Trabajo
 */
export interface WorkOrderMaterial {
  rawMaterialId: string;
  rawMaterialName: string;
  quantityRequired: number;
  quantityUsed: number;
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number;
}

/**
 * Orden de Trabajo - Fases de producción
 * Representa una fase específica dentro de la ejecución del proyecto
 */
export interface WorkOrder {
  id: string;
  projectId: string;
  
  // Información
  name: string;                    // Ej: "Corte de madera"
  description?: string;
  phase: string;                   // Ej: "Producción", "Acabado"
  status: WorkOrderStatus;
  
  // Responsable
  assignedTo: string;              // UID del responsable
  
  // Fechas
  estimatedStartDate?: Timestamp;
  estimatedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Progreso
  progressPercent: number;
  
  // Materiales (referencia a inventario)
  materials: WorkOrderMaterial[];
  
  // Mano de obra
  laborHours: number;              // Horas trabajadas
  laborCostPerHour: number;
  
  // Costos
  estimatedCost: number;
  actualCost: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Tarea del Proyecto
 * Representa una tarea específica dentro de un proyecto u orden de trabajo
 */
export interface ProjectTask {
  id: string;
  projectId: string;
  workOrderId?: string;            // Opcional, puede estar ligada a una orden
  
  // Información
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  
  // Asignación
  assignedTo?: string;
  
  // Fechas
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  
  // Estimación
  estimatedHours?: number;
  actualHours?: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Sesión de Trabajo (Time Tracking)
 * Registra tiempo trabajado por usuarios en proyectos/órdenes/tareas
 */
export interface WorkSession {
  id: string;
  projectId: string;
  workOrderId?: string;
  taskId?: string;
  
  // Usuario
  userId: string;
  userName: string;
  
  // Tiempo
  startTime: Timestamp;
  endTime?: Timestamp;
  durationSeconds: number;
  
  // Costo
  hourlyRate: number;
  totalCost: number;
  
  // Notas
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
}

/**
 * Tipo de evento en el timeline del proyecto
 */
export type ProjectTimelineEventType = 
  | 'status-change'
  | 'work-order-completed'
  | 'task-completed'
  | 'note'
  | 'material-consumed'
  | 'cost-update'
  | 'milestone'
  | 'team-member-added'
  | 'team-member-removed';

/**
 * Entrada de Timeline del Proyecto
 * Registra todos los eventos importantes del proyecto
 */
export interface ProjectTimelineEntry {
  id: string;
  projectId: string;
  
  // Tipo de evento
  type: ProjectTimelineEventType;
  
  // Contenido
  title: string;
  description?: string;
  
  // Datos específicos (JSON flexible)
  metadata?: Record<string, unknown>;
  
  // Usuario
  performedBy: string;
  performedByName: string;
  
  // Fecha
  performedAt: Timestamp;
}

/**
 * Estado de conversión de Cotización a Proyecto
 * Usado durante el proceso de conversión del QuoteAcceptanceWizard
 */
export interface QuoteToProjectConversion {
  quoteId: string;
  projectId?: string;
  
  // Configuración del Proyecto
  projectConfig: {
    name: string;
    description?: string;
    projectManager: string;
    teamMembers: string[];
    startDate: Timestamp;
    estimatedEndDate: Timestamp;
  };
  
  // Reservas de Inventario
  inventoryReservations: {
    itemId: string;
    itemName: string;
    quantityReserved: number;
    status: 'reserved' | 'pending' | 'failed';
  }[];
  
  // Órdenes de Trabajo
  workOrders: {
    name: string;
    phase: string;
    assignedTo: string;
    materials: WorkOrderMaterial[];
    estimatedHours: number;
  }[];
  
  // Estado
  status: 'preparing' | 'converting' | 'completed' | 'failed';
  error?: string;
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

/**
 * Parámetros de búsqueda de proyectos
 */
export interface ProjectSearchParams {
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
 * Estado del directorio de proyectos
 * Usado en el hook use-projects
 */
export interface ProjectDirectoryState {
  projects: Project[];
  loading: boolean;
  error?: string;
  searchParams: ProjectSearchParams;
  totalCount: number;
}

/**
 * Estado del perfil de proyecto
 * Usado en el hook use-project-profile
 */
export interface ProjectProfileState {
  project?: Project;
  workOrders: WorkOrder[];
  tasks: ProjectTask[];
  workSessions: WorkSession[];
  timeline: ProjectTimelineEntry[];
  loading: boolean;
  error?: string;
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

/**
 * Filtros de proyectos para UI
 */
export interface ProjectFilters {
  searchQuery: string;
  statusFilter: ProjectStatus | 'all';
  priorityFilter: ProjectPriority | 'all';
  clientFilter: string | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
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
 * Datos para crear una orden de trabajo
 */
export type CreateWorkOrderData = Omit<
  WorkOrder,
  'id' | 'createdAt' | 'updatedAt' | 'actualCost' | 'laborHours' | 'progressPercent'
>;

/**
 * Datos para actualizar una orden de trabajo
 */
export type UpdateWorkOrderData = Partial<
  Omit<WorkOrder, 'id' | 'projectId' | 'createdAt' | 'createdBy'>
>;

/**
 * Datos para crear una tarea
 */
export type CreateTaskData = Omit<
  ProjectTask,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'actualHours'
>;

/**
 * Datos para actualizar una tarea
 */
export type UpdateTaskData = Partial<
  Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'createdBy'>
>;

/**
 * Mapeo de estados a colores para UI
 */
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; variant: string }> = {
  planning: {
    label: 'Planificación',
    color: 'bg-blue-500',
    variant: 'default',
  },
  'in-progress': {
    label: 'En Progreso',
    color: 'bg-yellow-500',
    variant: 'secondary',
  },
  'on-hold': {
    label: 'En Espera',
    color: 'bg-orange-500',
    variant: 'outline',
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-500',
    variant: 'success',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500',
    variant: 'destructive',
  },
};

/**
 * Mapeo de prioridades a colores para UI
 */
export const PROJECT_PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string }> = {
  low: {
    label: 'Baja',
    color: 'text-gray-500',
  },
  medium: {
    label: 'Media',
    color: 'text-blue-500',
  },
  high: {
    label: 'Alta',
    color: 'text-orange-500',
  },
  urgent: {
    label: 'Urgente',
    color: 'text-red-500',
  },
};

/**
 * Mapeo de estados de órdenes de trabajo
 */
export const WORK_ORDER_STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string }> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-gray-500',
  },
  'in-progress': {
    label: 'En Proceso',
    color: 'bg-blue-500',
  },
  paused: {
    label: 'Pausado',
    color: 'bg-orange-500',
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-500',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500',
  },
};

/**
 * Mapeo de estados de tareas
 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: {
    label: 'Por Hacer',
    color: 'bg-gray-500',
  },
  'in-progress': {
    label: 'En Progreso',
    color: 'bg-blue-500',
  },
  review: {
    label: 'En Revisión',
    color: 'bg-yellow-500',
  },
  done: {
    label: 'Completada',
    color: 'bg-green-500',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-500',
  },
};
