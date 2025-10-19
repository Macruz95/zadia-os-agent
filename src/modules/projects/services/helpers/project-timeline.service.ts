/**
 * ZADIA OS - Project Timeline Service
 * Gestión del timeline de proyectos
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectTimelineEntry } from '../../types/projects.types';

export const ProjectTimelineService = {
  /**
   * Agregar entrada al timeline del proyecto
   * @param entry - Entrada del timeline sin ID
   */
  async addTimelineEntry(
    entry: Omit<ProjectTimelineEntry, 'id'>
  ): Promise<void> {
    try {
      const timelineRef = collection(db, 'projectTimeline');
      await addDoc(timelineRef, entry);
    } catch (error) {
      logger.error('Error adding timeline entry', error as Error);
      // No lanzar error para no bloquear operaciones principales
    }
  },

  /**
   * Obtener timeline del proyecto
   * @param projectId - ID del proyecto
   * @returns Lista de entradas del timeline ordenadas por fecha desc
   */
  async getProjectTimeline(
    projectId: string
  ): Promise<ProjectTimelineEntry[]> {
    try {
      const timelineRef = collection(db, 'projectTimeline');
      const q = query(
        timelineRef,
        where('projectId', '==', projectId),
        orderBy('performedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectTimelineEntry[];
    } catch (error) {
      logger.error('Error fetching project timeline', error as Error);
      return [];
    }
  },
};
