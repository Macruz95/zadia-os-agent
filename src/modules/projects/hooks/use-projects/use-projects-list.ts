/**
 * ZADIA OS - Use Projects List Hook
 * Hook principal para lista de proyectos con realtime
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useTenantId } from '@/contexts/TenantContext';
import type { Project } from '../../types/projects.types';
import type { UseProjectsState, UseProjectsOptions } from './types';
import { buildQueryConstraints } from './query-builder';
import { filterProjectsBySearch } from './search-filter';

/**
 * Custom hook for managing Projects with real Firebase integration
 * Follows Rule #1: Real Firebase data with onSnapshot for realtime updates
 * Follows Rule #3: Uses Zod-validated types
 * Follows Rule #4: Modular hook architecture
 */
export function useProjects(options: UseProjectsOptions = {}): UseProjectsState {
  const {
    filters = {},
    pageSize = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    realtime = true,
  } = options;

  const tenantId = useTenantId();

  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: true,
    error: null,
    totalCount: 0,
  });

  useEffect(() => {
    // Wait for tenant ID
    if (!tenantId) {
      setState({
        projects: [],
        loading: false,
        error: null,
        totalCount: 0,
      });
      return;
    }

    // Build query constraints
    const constraints = buildQueryConstraints(filters, {
      pageSize,
      sortBy,
      sortOrder,
    });

    // Create query with tenant filter FIRST
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('tenantId', '==', tenantId), ...constraints);

    // Set up realtime listener
    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projectsData: Project[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            projectsData.push({
              id: doc.id,
              ...data,
            } as Project);
          });

          // Client-side search filter
          const filteredProjects = filterProjectsBySearch(
            projectsData,
            filters.searchTerm
          );

          setState({
            projects: filteredProjects,
            loading: false,
            error: null,
            totalCount: filteredProjects.length,
          });
        },
        (error) => {
          logger.error('Error fetching projects (realtime)', error as Error);
          setState({
            projects: [],
            loading: false,
            error: 'Error al cargar los proyectos',
            totalCount: 0,
          });
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // One-time fetch not implemented - realtime preferred
      logger.info('One-time fetch mode not implemented - using realtime by default');
    }
  }, [
    tenantId,
    filters.status,
    filters.priority,
    filters.clientId,
    filters.projectManager,
    filters.searchTerm,
    filters.dateFrom,
    filters.dateTo,
    pageSize,
    sortBy,
    sortOrder,
    realtime,
  ]);

  return state;
}
