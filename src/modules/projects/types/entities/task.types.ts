/**
 * ZADIA OS - Task Entity Types
 * Tipos de tareas de proyectos
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';
import type { ProjectPriority } from './project.types';

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
