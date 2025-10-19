/**
 * ZADIA OS - Project UI Config Types
 * Configuraciones visuales para estados, prioridades y más
 * Rule #5: Max 200 lines per file
 */

import type { ProjectStatus, ProjectPriority } from '../entities/project.types';
import type { WorkOrderStatus } from '../entities/work-order.types';
import type { TaskStatus } from '../entities/task.types';

/**
 * Mapeo de estados a colores para UI
 */
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; variant: string }
> = {
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
export const PROJECT_PRIORITY_CONFIG: Record<
  ProjectPriority,
  { label: string; color: string }
> = {
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
export const WORK_ORDER_STATUS_CONFIG: Record<
  WorkOrderStatus,
  { label: string; color: string }
> = {
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
export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
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
