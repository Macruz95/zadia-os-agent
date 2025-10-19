/**
 * ZADIA OS - Use Projects Hook (Facade)
 * Hook modular para gestión de proyectos
 * Rule #5: Modular architecture - Main facade
 */

// Main hooks
export { useProjects } from './use-projects/use-projects-list';
export { useProject } from './use-projects/use-project-single';
export { useProjectsKPIs } from './use-projects/use-projects-kpis';

// Types
export type {
  UseProjectsState,
  UseProjectState,
  ProjectFilters,
  UseProjectsOptions,
  ProjectsKPIs,
} from './use-projects/types';

// Utility functions (if needed externally)
export { buildQueryConstraints } from './use-projects/query-builder';
export { filterProjectsBySearch } from './use-projects/search-filter';
