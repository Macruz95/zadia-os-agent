/**
 * ZADIA OS - Project Status Service
 * Gestión de estados y progreso de proyectos
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectStatus } from '../../types/projects.types';
import { ProjectTimelineService } from './project-timeline.service';

/**
 * Actualizar estado del proyecto
 * @param projectId - ID del proyecto
 * @param newStatus - Nuevo estado
 * @param userId - ID del usuario que realiza el cambio
 * @param userName - Nombre del usuario
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);

    // Preparar actualizaciones base
    const updates: any = {
      status: newStatus,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    // 🎯 LÓGICA HÍBRIDA DE PROGRESO
    if (newStatus === 'completed') {
      // Completado -> 100% siempre
      updates.progressPercent = 100;
      updates.actualEndDate = Timestamp.now();
    } else if (newStatus === 'planning') {
      // Planificación -> 0%
      updates.progressPercent = 0;
    } else if (newStatus === 'in-progress') {
      // En progreso -> calcular basado en tareas si existen
      const { calculateProjectProgress } = await import('./project-progress.service');
      const calculatedProgress = await calculateProjectProgress(projectId);

      if (calculatedProgress !== null) {
        updates.progressPercent = calculatedProgress;
      }
      // Si no hay tareas, mantener progreso actual

      updates.actualStartDate = Timestamp.now();
    }
    // 'cancelled' y 'on-hold' mantienen progreso actual

    await updateDoc(projectRef, updates);

    // Registrar en timeline
    await ProjectTimelineService.addTimelineEntry({
      projectId,
      type: 'status-change',
      title: 'Estado actualizado',
      description: `Proyecto cambió a estado: ${newStatus}`,
      performedBy: userId,
      performedByName: userName,
      performedAt: Timestamp.now(),
    });

    logger.info('Project status updated', {
      projectId,
      metadata: { newStatus, progressPercent: updates.progressPercent }
    });
  } catch (error) {
    logger.error('Error updating project status', error as Error);
    throw new Error('Error al actualizar estado del proyecto');
  }
}

/**
 * Actualizar progreso del proyecto
 * @param projectId - ID del proyecto
 * @param progressPercent - Porcentaje de progreso (0-100)
 */
export async function updateProgress(
  projectId: string,
  progressPercent: number
): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);

    await updateDoc(projectRef, {
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logger.error('Error updating project progress', error as Error);
    throw new Error('Error al actualizar progreso');
  }
}
