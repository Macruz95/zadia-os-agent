/**
 * ZADIA OS - Project Delete Service
 * Eliminación de proyectos y datos relacionados
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

/**
 * Eliminar proyecto (solo admin)
 * Elimina proyecto y sus datos relacionados en transacción
 * @param projectId - ID del proyecto a eliminar
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Eliminar proyecto
    const projectRef = doc(db, 'projects', projectId);
    batch.delete(projectRef);

    // Eliminar órdenes de trabajo
    const workOrdersRef = collection(db, 'workOrders');
    const workOrdersQuery = query(
      workOrdersRef,
      where('projectId', '==', projectId)
    );
    const workOrdersSnapshot = await getDocs(workOrdersQuery);
    workOrdersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Eliminar tareas
    const tasksRef = collection(db, 'projectTasks');
    const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Eliminar timeline
    const timelineRef = collection(db, 'projectTimeline');
    const timelineQuery = query(
      timelineRef,
      where('projectId', '==', projectId)
    );
    const timelineSnapshot = await getDocs(timelineQuery);
    timelineSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    logger.error('Error deleting project', error as Error);
    throw new Error('Error al eliminar el proyecto');
  }
}
