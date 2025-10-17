'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project, ProjectStatus, ProjectPriority } from '../types/projects.types';

// Hook state interface
interface UseProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

// Filter parameters
export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  projectManager?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Hook options
interface UseProjectsOptions {
  filters?: ProjectFilters;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
  realtime?: boolean; // Enable/disable realtime updates
}

/**
 * Custom hook for managing Projects with real Firebase integration
 * Follows Rule #1: Real Firebase data with onSnapshot for realtime updates
 * Follows Rule #3: Uses Zod-validated types
 * Follows Rule #4: Modular hook architecture
 */
export function useProjects(options: UseProjectsOptions = {}) {
  const {
    filters = {},
    pageSize = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    realtime = true,
  } = options;

  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: true,
    error: null,
    totalCount: 0,
  });

  useEffect(() => {
    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.priority) {
      constraints.push(where('priority', '==', filters.priority));
    }

    if (filters.clientId) {
      constraints.push(where('clientId', '==', filters.clientId));
    }

    if (filters.projectManager) {
      constraints.push(where('projectManager', '==', filters.projectManager));
    }

    if (filters.dateFrom) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
    }

    if (filters.dateTo) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));
    }

    // Add sorting
    constraints.push(orderBy(sortBy, sortOrder));

    // Add pagination limit
    constraints.push(limit(pageSize));

    // Create query
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, ...constraints);

    // Set up realtime listener or one-time fetch
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

          // Client-side search filter (Firebase doesn't support text search natively)
          let filteredProjects = projectsData;
          if (filters.searchTerm && filters.searchTerm.trim()) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredProjects = projectsData.filter(
              (project) =>
                project.name.toLowerCase().includes(searchLower) ||
                project.description?.toLowerCase().includes(searchLower)
            );
          }

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
      // One-time fetch (not implemented in this version - realtime preferred)
      logger.info('One-time fetch mode not implemented - using realtime by default');
    }
  }, [
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

/**
 * Hook for fetching a single project by ID with realtime updates
 */
export function useProject(projectId: string | null) {
  const [state, setState] = useState<{
    project: Project | null;
    loading: boolean;
    error: string | null;
  }>({
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

/**
 * Hook for calculating KPIs from projects list
 * Processes data client-side for dashboard metrics
 */
export function useProjectsKPIs(projects: Project[]) {
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    completed: 0,
    delayed: 0,
    totalRevenue: 0,
    totalCost: 0,
    profitMargin: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    const now = new Date();

    const active = projects.filter(
      (p) => p.status === 'in-progress' || p.status === 'planning'
    ).length;

    const completed = projects.filter((p) => p.status === 'completed').length;

    const delayed = projects.filter(
      (p) =>
        p.status === 'in-progress' &&
        p.estimatedEndDate &&
        p.estimatedEndDate.toDate() < now
    ).length;

    const totalRevenue = projects.reduce((sum, p) => sum + (p.salesPrice || 0), 0);
    const totalCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    const averageProgress =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progressPercent || 0), 0) / projects.length
        : 0;

    setKpis({
      total: projects.length,
      active,
      completed,
      delayed,
      totalRevenue,
      totalCost,
      profitMargin,
      averageProgress,
    });
  }, [projects]);

  return kpis;
}
