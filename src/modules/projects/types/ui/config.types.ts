/**
 * ZADIA OS - Project UI Config Types
 * Configuraciones visuales para estados, prioridades y más
 * Rule #5: Max 200 lines per file
 */

import type { ProjectStatus, ProjectPriority } from '../entities/project.types';
import type { WorkOrderStatus } from '../entities/work-order.types';
import type { TaskStatus } from '../entities/task.types';
import { 
  ClipboardList, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowUp,
  Minus,
  AlertTriangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Mapeo de estados a colores para UI
 */
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; variant: string; icon: LucideIcon }
> = {
  planning: {
    label: 'Planificación',
    color: '#3b82f6',
    variant: 'default',
    icon: ClipboardList,
  },
  'in-progress': {
    label: 'En Progreso',
    color: '#eab308',
    variant: 'secondary',
    icon: PlayCircle,
  },
  'on-hold': {
    label: 'En Espera',
    color: '#f97316',
    variant: 'outline',
    icon: PauseCircle,
  },
  completed: {
    label: 'Completado',
    color: '#22c55e',
    variant: 'success',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    color: '#ef4444',
    variant: 'destructive',
    icon: XCircle,
  },
};

/**
 * Mapeo de prioridades a colores para UI
 */
export const PROJECT_PRIORITY_CONFIG: Record<
  ProjectPriority,
  { label: string; color: string; icon: LucideIcon }
> = {
  low: {
    label: 'Baja',
    color: '#6b7280',
    icon: Minus,
  },
  medium: {
    label: 'Media',
    color: '#3b82f6',
    icon: AlertCircle,
  },
  high: {
    label: 'Alta',
    color: '#f97316',
    icon: ArrowUp,
  },
  urgent: {
    label: 'Urgente',
    color: '#ef4444',
    icon: AlertTriangle,
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
