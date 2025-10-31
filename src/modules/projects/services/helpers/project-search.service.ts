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
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project, ProjectSearchParams } from '../../types/projects.types';

const PROJECTS_COLLECTION = 'projects';

function toTimestampSafe(value: unknown): Timestamp | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof (value as { seconds: unknown }).seconds === 'number' &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === 'number'
  ) {
    const { seconds, nanoseconds } = value as { seconds: number; nanoseconds: number };
    return new Timestamp(seconds, nanoseconds);
  }
  return undefined;
}

/**
 * Convertir documento Firestore a Project
 */
function docToProject(doc: QueryDocumentSnapshot<DocumentData>): Project {
  const data = doc.data() as Partial<Project>;
  return ({
    ...data,
    id: doc.id,
    createdAt: toTimestampSafe(data.createdAt) || Timestamp.fromDate(new Date()),
    updatedAt: toTimestampSafe(data.updatedAt) || Timestamp.fromDate(new Date()),
    startDate: toTimestampSafe(data.startDate),
    estimatedEndDate: toTimestampSafe(data.estimatedEndDate),
    actualEndDate: toTimestampSafe(data.actualEndDate),
  } as unknown) as Project;
}

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
    const projectsRef = collection(db, PROJECTS_COLLECTION);
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
    const projects: Project[] = [];

    snapshot.forEach((doc) => {
      projects.push(docToProject(doc));
    });

    return {
      projects,
      totalCount: projects.length,
    };
  } catch (error) {
    logger.error('Error searching projects', error as Error);
    throw new Error('Error al buscar proyectos');
  }
}
