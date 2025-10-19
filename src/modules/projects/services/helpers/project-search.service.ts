/**
 * ZADIA OS - Project Search Service
 * Búsqueda y filtrado de proyectos
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project, ProjectSearchParams } from '../../types/projects.types';

/**
 * Buscar proyectos con filtros
 * @param params - Parámetros de búsqueda validados
 * @returns Lista de proyectos y total
 */
export async function searchProjects(
  params: ProjectSearchParams = {}
): Promise<{
  projects: Project[];
  totalCount: number;
}> {
  try {
    const projectsRef = collection(db, 'projects');
    let q = query(projectsRef);

    // Aplicar filtros
    if (params.status) {
      q = query(q, where('status', '==', params.status));
    }
    if (params.priority) {
      q = query(q, where('priority', '==', params.priority));
    }
    if (params.clientId) {
      q = query(q, where('clientId', '==', params.clientId));
    }
    if (params.projectManager) {
      q = query(q, where('projectManager', '==', params.projectManager));
    }

    // Ordenar
    const sortField = params.sortBy || 'createdAt';
    const sortDirection = params.sortOrder || 'desc';
    q = query(q, orderBy(sortField, sortDirection));

    // Limitar resultados
    if (params.pageSize) {
      q = query(q, limit(params.pageSize));
    }

    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];

    return {
      projects,
      totalCount: projects.length,
    };
  } catch (error) {
    logger.error('Error searching projects', error as Error);
    throw new Error('Error al buscar proyectos');
  }
}
