/**
 * ZADIA OS - Projects & Tasks Search Module
 * Search projects and tasks
 */

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { SearchResult } from '@/types/command-bar.types';

/**
 * Search projects by name
 */
export async function searchProjects(
  term: string,
  userId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('name'),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';

      if (name.includes(term)) {
        results.push({
          id: doc.id,
          type: 'project',
          title: data.name || 'Proyecto sin nombre',
          subtitle: `${data.status || 'Sin estado'} - ${data.clientName || ''}`,
          metadata: { status: data.status, budget: data.budget },
          url: `/projects/${doc.id}`,
          icon: 'Briefcase',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Project search failed', error as Error);
    return [];
  }
}

/**
 * Search tasks by title or description
 */
export async function searchTasks(
  term: string,
  userId: string,
  max: number
): Promise<SearchResult[]> {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      limit(max * 2)
    );

    const snapshot = await getDocs(q);
    const results: SearchResult[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const title = data.title?.toLowerCase() || '';
      const description = data.description?.toLowerCase() || '';

      if (title.includes(term) || description.includes(term)) {
        results.push({
          id: doc.id,
          type: 'task',
          title: data.title || 'Tarea sin título',
          subtitle: `${data.projectName || ''} - ${data.status || ''}`,
          metadata: { status: data.status, priority: data.priority },
          url: `/tasks/${doc.id}`,
          icon: 'CheckSquare',
        });
      }
    });

    return results.slice(0, max);
  } catch (error) {
    logger.error('Task search failed', error as Error);
    return [];
  }
}
