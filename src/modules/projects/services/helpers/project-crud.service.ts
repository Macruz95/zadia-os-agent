/**
 * ZADIA OS - Project CRUD Operations
 * Operaciones básicas de creación, lectura y actualización
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project } from '../../types/projects.types';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../../validations/projects.validation';
import { ProjectTimelineService } from './project-timeline.service';

const PROJECTS_COLLECTION = 'projects';

function removeUndefinedDeep<T>(value: T): T {
  if (value instanceof Timestamp) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => removeUndefinedDeep(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined) {
        return;
      }
      const cleaned = removeUndefinedDeep(val);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    });
    return result as T;
  }

  return value;
}

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
 * Crear un nuevo proyecto
 * @param projectData - Datos del proyecto validados con Zod
 * @param tenantId - Required tenant ID for data isolation
 * @returns ID del proyecto creado
 */
export async function createProject(
  projectData: CreateProjectInput,
  tenantId?: string
): Promise<string> {
  if (!tenantId) {
    throw new Error('tenantId is required for data isolation');
  }
  
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);

    const newProject = {
      ...projectData,
      tenantId, // CRITICAL: Add tenant isolation
      // Valores iniciales calculados
      actualCost: 0,
      materialsCost: 0,
      laborCost: 0,
      overheadCost: 0,
      progressPercent: 0,
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Sanitizar para Firestore
    const sanitizedProject = removeUndefinedDeep(newProject);

    const docRef = await addDoc(projectsRef, sanitizedProject);

    // Crear entrada en timeline
    await ProjectTimelineService.addTimelineEntry({
      projectId: docRef.id,
      type: 'status-change',
      title: 'Proyecto creado',
      description: `Proyecto "${projectData.name}" creado${
        projectData.quoteNumber
          ? ` desde cotización ${projectData.quoteNumber}`
          : ''
      }`,
      performedBy: projectData.createdBy,
      performedByName: 'Sistema',
      performedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error creating project', error as Error);
    throw new Error('Error al crear el proyecto');
  }
}

/**
 * Obtener proyecto por ID
 * @param projectId - ID del proyecto
 * @returns Proyecto o null si no existe
 */
export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return null;
    }

    const data = projectDoc.data() as Partial<Project>;
    return ({
      ...data,
      id: projectDoc.id,
      createdAt: toTimestampSafe(data.createdAt) || Timestamp.fromDate(new Date()),
      updatedAt: toTimestampSafe(data.updatedAt) || Timestamp.fromDate(new Date()),
      startDate: toTimestampSafe(data.startDate),
      estimatedEndDate: toTimestampSafe(data.estimatedEndDate),
      actualEndDate: toTimestampSafe(data.actualEndDate),
    } as unknown) as Project;
  } catch (error) {
    logger.error('Error fetching project', error as Error);
    throw new Error('Error al obtener el proyecto');
  }
}

/**
 * Actualizar proyecto
 * @param projectId - ID del proyecto
 * @param updates - Datos a actualizar validados con Zod
 */
export async function updateProject(
  projectId: string,
  updates: UpdateProjectInput
): Promise<void> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Sanitizar para Firestore
    const sanitizedUpdates = removeUndefinedDeep(updateData);

    await updateDoc(projectRef, sanitizedUpdates);
  } catch (error) {
    logger.error('Error updating project', error as Error);
    throw new Error('Error al actualizar el proyecto');
  }
}
