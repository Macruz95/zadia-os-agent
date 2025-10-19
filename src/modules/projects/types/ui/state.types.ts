/**
 * ZADIA OS - Project UI State Types
 * Estados de hooks y componentes de UI
 * Rule #5: Max 200 lines per file
 */

import type { Project, ProjectSearchParams } from '../entities/project.types';
import type { WorkOrder } from '../entities/work-order.types';
import type { ProjectTask } from '../entities/task.types';
import type { WorkSession, ProjectTimelineEntry } from '../entities/timeline.types';
import type { ProjectPriority, ProjectStatus } from '../entities/project.types';

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
