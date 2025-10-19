/**
 * ZADIA OS - Use Projects Types
 * Types y interfaces para hooks de proyectos
 * Rule #5: Max 200 lines per file
 */

import type { Project, ProjectStatus, ProjectPriority } from '../../types/projects.types';

/**
 * Estado del hook useProjects
 */
export interface UseProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

/**
 * Filtros de proyectos
 */
export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  projectManager?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Opciones del hook useProjects
 */
export interface UseProjectsOptions {
  filters?: ProjectFilters;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
  realtime?: boolean;
}

/**
 * Estado del hook useProject
 */
export interface UseProjectState {
  project: Project | null;
  loading: boolean;
  error: string | null;
}

/**
 * KPIs calculados de proyectos
 */
export interface ProjectsKPIs {
  total: number;
  active: number;
  completed: number;
  delayed: number;
  totalRevenue: number;
  totalCost: number;
  profitMargin: number;
  averageProgress: number;
}
