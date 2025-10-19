/**
 * ZADIA OS - Use Project Single Hook
 * Hook para un proyecto individual con realtime
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project } from '../../types/projects.types';
import type { UseProjectState } from './types';

/**
 * Hook for fetching a single project by ID with realtime updates
 * @param projectId - ID del proyecto o null
 * @returns Estado con proyecto, loading y error
 */
export function useProject(projectId: string | null): UseProjectState {
  const [state, setState] = useState<UseProjectState>({
    project: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!projectId) {
      setState({ project: null, loading: false, error: null });
      return;
    }

    const projectRef = collection(db, 'projects');
    const q = query(projectRef, where('__name__', '==', projectId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setState({
            project: null,
            loading: false,
            error: 'Proyecto no encontrado',
          });
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        setState({
          project: {
            id: doc.id,
            ...data,
          } as Project,
          loading: false,
          error: null,
        });
      },
      (error) => {
        logger.error('Error fetching project by ID', error as Error);
        setState({
          project: null,
          loading: false,
          error: 'Error al cargar el proyecto',
        });
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return state;
}
