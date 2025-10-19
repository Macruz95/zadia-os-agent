/**
 * ZADIA OS - Timeline Entity Types
 * Tipos de eventos y tracking de proyectos
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

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
