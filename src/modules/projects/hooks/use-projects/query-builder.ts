/**
 * ZADIA OS - Use Projects Query Builder
 * Construcción de queries Firestore
 * Rule #5: Max 200 lines per file
 */

import {
  where,
  orderBy,
  limit,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import type { ProjectFilters, UseProjectsOptions } from './types';

/**
 * Construir constraints de Firestore desde filtros
 * @param filters - Filtros de proyectos
 * @param options - Opciones de paginación y ordenamiento
 * @returns Array de QueryConstraint
 */
export function buildQueryConstraints(
  filters: ProjectFilters,
  options: UseProjectsOptions
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  const { pageSize = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  // Aplicar filtros
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }

  if (filters.priority) {
    constraints.push(where('priority', '==', filters.priority));
  }

  if (filters.clientId) {
    constraints.push(where('clientId', '==', filters.clientId));
  }

  if (filters.projectManager) {
    constraints.push(where('projectManager', '==', filters.projectManager));
  }

  if (filters.dateFrom) {
    constraints.push(
      where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom))
    );
  }

  if (filters.dateTo) {
    constraints.push(
      where('createdAt', '<=', Timestamp.fromDate(filters.dateTo))
    );
  }

  // Agregar ordenamiento
  constraints.push(orderBy(sortBy, sortOrder));

  // Agregar límite de paginación
  constraints.push(limit(pageSize));

  return constraints;
}
