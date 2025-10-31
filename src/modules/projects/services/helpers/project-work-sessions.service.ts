/**
 * ZADIA OS - Project Work Sessions Service
 * Control de tiempo trabajado en proyectos
 * Rule #1: Real Firebase operations
 * Rule #3: Zod validation
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { WorkSession } from '../../types/projects.types';
import {
  startWorkSessionSchema,
  endWorkSessionSchema,
  type StartWorkSessionInput,
  type EndWorkSessionInput,
} from '../../validations/project-extensions.validation';

const WORK_SESSIONS_COLLECTION = 'workSessions';

/**
 * Iniciar sesión de trabajo
 */
export async function startWorkSession(
  data: StartWorkSessionInput
): Promise<string> {
  try {
    // Validar con Zod
    const validated = startWorkSessionSchema.parse(data);

    const sessionData = {
      projectId: validated.projectId,
      workOrderId: validated.workOrderId || null,
      taskId: validated.taskId || null,
      userId: validated.userId,
      userName: validated.userName,
      startTime: serverTimestamp(),
      endTime: null,
      durationSeconds: 0,
      hourlyRate: validated.hourlyRate,
      totalCost: 0,
      notes: validated.notes || '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, WORK_SESSIONS_COLLECTION),
      sessionData
    );

    logger.info('Work session started', {
      component: 'WorkSessionsService',
      action: 'start',
      metadata: { sessionId: docRef.id, projectId: validated.projectId },
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error starting work session', error as Error, {
      component: 'WorkSessionsService',
      action: 'start',
    });
    throw new Error('Error al iniciar sesión de trabajo');
  }
}

/**
 * Finalizar sesión de trabajo
 */
export async function endWorkSession(
  data: EndWorkSessionInput
): Promise<void> {
  try {
    // Validar con Zod
    const validated = endWorkSessionSchema.parse(data);

    const sessionRef = doc(db, WORK_SESSIONS_COLLECTION, validated.sessionId);
    
    // Obtener datos de la sesión para calcular duración
    const sessionSnap = await import('firebase/firestore').then(m => 
      m.getDoc(sessionRef)
    );
    
    if (!sessionSnap.exists()) {
      throw new Error('Sesión no encontrada');
    }

    const sessionData = sessionSnap.data();
    const startTime = sessionData.startTime as Timestamp;
    const endTime = Timestamp.now();
    const durationSeconds = Math.round(
      (endTime.toMillis() - startTime.toMillis()) / 1000
    );
    
    const totalCost = (durationSeconds / 3600) * sessionData.hourlyRate;

    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
      durationSeconds,
      totalCost,
      notes: validated.notes || sessionData.notes,
      updatedAt: serverTimestamp(),
    });

    logger.info('Work session ended', {
      component: 'WorkSessionsService',
      action: 'end',
      metadata: { 
        sessionId: validated.sessionId, 
        durationSeconds,
        totalCost 
      },
    });
  } catch (error) {
    logger.error('Error ending work session', error as Error, {
      component: 'WorkSessionsService',
      action: 'end',
    });
    throw new Error('Error al finalizar sesión de trabajo');
  }
}

/**
 * Obtener sesiones de trabajo de un proyecto
 */
export async function getProjectWorkSessions(
  projectId: string
): Promise<WorkSession[]> {
  try {
    const q = query(
      collection(db, WORK_SESSIONS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkSession[];
  } catch (error) {
    logger.error('Error fetching project work sessions', error as Error, {
      component: 'WorkSessionsService',
      action: 'getProjectSessions',
    });
    throw new Error('Error al obtener sesiones de trabajo');
  }
}

/**
 * Obtener sesión activa de un usuario
 */
export async function getActiveUserSession(
  userId: string,
  projectId?: string
): Promise<WorkSession | null> {
  try {
    let q = query(
      collection(db, WORK_SESSIONS_COLLECTION),
      where('userId', '==', userId),
      where('endTime', '==', null)
    );

    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as WorkSession;
  } catch (error) {
    logger.error('Error fetching active session', error as Error, {
      component: 'WorkSessionsService',
      action: 'getActiveSession',
    });
    throw new Error('Error al obtener sesión activa');
  }
}

/**
 * Eliminar sesión de trabajo
 */
export async function deleteWorkSession(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, WORK_SESSIONS_COLLECTION, sessionId));

    logger.info('Work session deleted', {
      component: 'WorkSessionsService',
      action: 'delete',
      metadata: { sessionId },
    });
  } catch (error) {
    logger.error('Error deleting work session', error as Error, {
      component: 'WorkSessionsService',
      action: 'delete',
    });
    throw new Error('Error al eliminar sesión de trabajo');
  }
}
