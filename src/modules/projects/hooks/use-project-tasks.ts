/**
 * ZADIA OS - useProjectTasks Hook
 * Hook para gestión de tareas del proyecto con Firebase real-time
 * Rule #1: Real Firebase data with realtime updates
 * Rule #4: Modular hook architecture
 * Rule #5: 145 lines (within limit)
 */

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectTask } from '../types/projects.types';

interface UseProjectTasksOptions {
  projectId?: string;
  workOrderId?: string;
  status?: ProjectTask['status'];
  assignedTo?: string;
  realtime?: boolean;
}

interface UseProjectTasksReturn {
  tasks: ProjectTask[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

const TASKS_COLLECTION = 'projectTasks';

export function useProjectTasks({
  projectId,
  workOrderId,
  status,
  assignedTo,
  realtime = true,
}: UseProjectTasksOptions = {}): UseProjectTasksReturn {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId && !workOrderId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query
      const constraints: QueryConstraint[] = [];

      if (projectId) {
        constraints.push(where('projectId', '==', projectId));
      }

      if (workOrderId) {
        constraints.push(where('workOrderId', '==', workOrderId));
      }

      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (assignedTo) {
        constraints.push(where('assignedTo', '==', assignedTo));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, TASKS_COLLECTION), ...constraints);

      // Setup realtime listener
      if (realtime) {
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const tasksData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as ProjectTask[];

            setTasks(tasksData);
            setLoading(false);
            setError(null);
          },
          (err) => {
            logger.error('Error in tasks realtime listener', err);
            setError(err.message);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      }
    } catch (err) {
      logger.error('Error setting up tasks listener', err as Error);
      setError((err as Error).message);
      setLoading(false);
    }
  }, [projectId, workOrderId, status, assignedTo, realtime]);

  // Calculate counts
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return {
    tasks,
    loading,
    error,
    totalCount,
    todoCount,
    inProgressCount,
    doneCount,
  };
}

/**
 * Hook para una tarea individual con realtime
 */
export function useTask(taskId: string | undefined) {
  const [task, setTask] = useState<ProjectTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement single task listener
      // const taskRef = doc(db, TASKS_COLLECTION, taskId);
      // const unsubscribe = onSnapshot(taskRef, ...);
      
      setLoading(false);
    } catch (err) {
      logger.error('Error loading task', err as Error);
      setError((err as Error).message);
      setLoading(false);
    }
  }, [taskId]);

  return { task, loading, error };
}
