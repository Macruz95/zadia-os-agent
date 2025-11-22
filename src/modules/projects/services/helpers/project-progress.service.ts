/**
 * ZADIA OS - Project Progress Service
 * Servicio dedicado para cálculo automático de progreso de proyectos
 * Rule #5: Max 200 lines per file
 */

import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectTask } from '../../types/projects.types';

const TASKS_COLLECTION = 'projectTasks';
const PROJECTS_COLLECTION = 'projects';

/**
 * Calcular progreso del proyecto basado en tareas completadas
 * Usa horas estimadas como peso para cálculo más preciso
 * @param projectId - ID del proyecto
 * @returns Porcentaje de progreso (0-100) o null si no hay tareas
 */
export async function calculateProjectProgress(projectId: string): Promise<number | null> {
    try {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('projectId', '==', projectId)
        );

        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ProjectTask[];

        // Si no hay tareas, retornar null (no se puede calcular)
        if (tasks.length === 0) {
            return null;
        }

        // Calcular peso total (suma de horas estimadas, o 1 por tarea si no tienen horas)
        const totalWeight = tasks.reduce((sum, task) => {
            return sum + (task.estimatedHours || 1);
        }, 0);

        // Calcular peso completado (solo tareas con status 'done')
        const completedWeight = tasks
            .filter(task => task.status === 'done')
            .reduce((sum, task) => {
                return sum + (task.estimatedHours || 1);
            }, 0);

        // Calcular porcentaje
        const progressPercent = Math.round((completedWeight / totalWeight) * 100);

        logger.info(`Project progress calculated: ${projectId} -> ${progressPercent}%`, {
            metadata: {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'done').length,
                totalWeight,
                completedWeight
            }
        });

        return progressPercent;
    } catch (error) {
        logger.error('Error calculating project progress', error as Error, {
            metadata: { projectId }
        });
        return null; // En caso de error, retornar null
    }
}

/**
 * Actualizar progreso del proyecto en Firestore
 * @param projectId - ID del proyecto
 * @param progressPercent - Porcentaje de progreso (0-100)
 */
export async function updateProjectProgress(
    projectId: string,
    progressPercent: number
): Promise<void> {
    try {
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

        await updateDoc(projectRef, {
            progressPercent: Math.min(100, Math.max(0, progressPercent)),
            updatedAt: Timestamp.now(),
        });

        logger.info(`Project progress updated: ${projectId} -> ${progressPercent}%`);
    } catch (error) {
        logger.error('Error updating project progress', error as Error, {
            metadata: { projectId, progressPercent }
        });
        throw error;
    }
}

/**
 * Recalcular y actualizar progreso del proyecto automáticamente
 * @param projectId - ID del proyecto
 * @returns true si se actualizó, false si no había tareas
 */
export async function recalculateAndUpdateProgress(projectId: string): Promise<boolean> {
    try {
        const calculatedProgress = await calculateProjectProgress(projectId);

        if (calculatedProgress !== null) {
            await updateProjectProgress(projectId, calculatedProgress);
            return true;
        }

        return false; // No hay tareas, no se actualizó
    } catch (error) {
        logger.error('Error recalculating project progress', error as Error, {
            metadata: { projectId }
        });
        return false;
    }
}
