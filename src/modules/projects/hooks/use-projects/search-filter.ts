/**
 * ZADIA OS - Use Projects Search Filter
 * Filtrado client-side para búsqueda de texto
 * Rule #5: Max 200 lines per file
 */

import type { Project } from '../../types/projects.types';

/**
 * Filtrar proyectos por término de búsqueda
 * Firebase no soporta búsqueda de texto nativa, se hace client-side
 * @param projects - Lista de proyectos
 * @param searchTerm - Término de búsqueda
 * @returns Proyectos filtrados
 */
export function filterProjectsBySearch(
  projects: Project[],
  searchTerm?: string
): Project[] {
  if (!searchTerm || !searchTerm.trim()) {
    return projects;
  }

  const searchLower = searchTerm.toLowerCase();

  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      project.clientName?.toLowerCase().includes(searchLower)
  );
}
