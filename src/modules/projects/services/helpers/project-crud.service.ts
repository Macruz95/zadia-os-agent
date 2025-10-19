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

/**
 * Crear un nuevo proyecto
 * @param projectData - Datos del proyecto validados con Zod
 * @returns ID del proyecto creado
 */
export async function createProject(
  projectData: CreateProjectInput
): Promise<string> {
  try {
    const projectsRef = collection(db, 'projects');

    const newProject = {
      ...projectData,
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

    const docRef = await addDoc(projectsRef, newProject);

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
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return null;
    }

    return {
      id: projectDoc.id,
      ...projectDoc.data(),
    } as Project;
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
    const projectRef = doc(db, 'projects', projectId);

    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logger.error('Error updating project', error as Error);
    throw new Error('Error al actualizar el proyecto');
  }
}
