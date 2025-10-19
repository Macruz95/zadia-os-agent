/**
 * ZADIA OS - Projects Service
 * Servicio principal de proyectos - Refactorizado
 * Rule #5: Max 200 lines per file
 * 
 * Arquitectura modular:
 * - project-crud.service: Operaciones CRUD básicas
 * - project-search.service: Búsqueda y filtrado
 * - project-status.service: Estados y progreso
 * - project-costs.service: Gestión de costos
 * - project-timeline.service: Timeline de eventos
 * - project-delete.service: Eliminación con limpieza
 */

// Importar servicios modulares
import {
  createProject,
  getProjectById,
  updateProject,
} from './helpers/project-crud.service';
import { searchProjects } from './helpers/project-search.service';
import {
  updateProjectStatus,
  updateProgress,
} from './helpers/project-status.service';
import { updateCosts } from './helpers/project-costs.service';
import { ProjectTimelineService } from './helpers/project-timeline.service';
import { deleteProject } from './helpers/project-delete.service';

/**
 * Servicio de Proyectos
 * Maneja todas las operaciones CRUD con Firebase Firestore
 * Arquitectura modular para mejor mantenimiento
 */
export const ProjectsService = {
  // CRUD Operations
  createProject,
  getProjectById,
  updateProject,

  // Search
  searchProjects,

  // Status & Progress
  updateProjectStatus,
  updateProgress,

  // Costs
  updateCosts,

  // Timeline
  addTimelineEntry: ProjectTimelineService.addTimelineEntry,
  getProjectTimeline: ProjectTimelineService.getProjectTimeline,

  // Delete
  deleteProject,
};
