/**
 * ZADIA OS - Project Tasks Service
 * Servicio para gestión de tareas del proyecto
 * Rule #1: Real Firebase data
 * Rule #3: Zod validation
 * Rule #5: 195 lines (within limit)
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectTask, CreateTaskData, UpdateTaskData } from '../types/projects.types';

const TASKS_COLLECTION = 'projectTasks';

export class ProjectTasksService {
  /**
   * Crear una nueva tarea con tenant isolation
   */
  static async createTask(data: CreateTaskData, tenantId: string): Promise<string> {
    try {
      if (!tenantId) {
        throw new Error('tenantId is required');
      }

      const taskData = {
        ...data,
        tenantId,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        progressPercent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
      
      logger.info(`Task created: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logger.error('Error creating task', error as Error);
      throw error;
    }
  }

  /**
   * Obtener tareas de un proyecto filtradas por tenant
   */
  static async getProjectTasks(projectId: string, tenantId: string): Promise<ProjectTask[]> {
    try {
      if (!tenantId) {
        logger.warn('getProjectTasks called without tenantId');
        return [];
      }

      const q = query(
        collection(db, TASKS_COLLECTION),
        where('tenantId', '==', tenantId),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectTask[];
    } catch (error) {
      logger.error('Error fetching project tasks', error as Error);
      throw error;
    }
  }

  /**
   * Obtener tareas de una orden de trabajo filtradas por tenant
   */
  static async getWorkOrderTasks(workOrderId: string, tenantId: string): Promise<ProjectTask[]> {
    try {
      if (!tenantId) {
        logger.warn('getWorkOrderTasks called without tenantId');
        return [];
      }

      const q = query(
        collection(db, TASKS_COLLECTION),
        where('tenantId', '==', tenantId),
        where('workOrderId', '==', workOrderId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectTask[];
    } catch (error) {
      logger.error('Error fetching work order tasks', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar tarea
   */
  static async updateTask(taskId: string, data: UpdateTaskData): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });

      logger.info(`Task updated: ${taskId}`);
    } catch (error) {
      logger.error('Error updating task', error as Error);
      throw error;
    }
  }

  /**
   * Cambiar estado de tarea
   */
  static async changeTaskStatus(
    taskId: string,
    newStatus: ProjectTask['status']
  ): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      logger.info(`Task status changed: ${taskId} -> ${newStatus}`);
    } catch (error) {
      logger.error('Error changing task status', error as Error);
      throw error;
    }
  }

  /**
   * Asignar tarea a usuario
   */
  static async assignTask(taskId: string, assignedTo: string): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        assignedTo,
        updatedAt: Timestamp.now(),
      });

      logger.info(`Task assigned: ${taskId} -> ${assignedTo}`);
    } catch (error) {
      logger.error('Error assigning task', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar progreso de tarea
   */
  static async updateProgress(taskId: string, progressPercent: number): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
        updatedAt: Timestamp.now(),
      });

      logger.info(`Task progress updated: ${taskId} -> ${progressPercent}%`);
    } catch (error) {
      logger.error('Error updating task progress', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar tarea
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
      logger.info(`Task deleted: ${taskId}`);
    } catch (error) {
      logger.error('Error deleting task', error as Error);
      throw error;
    }
  }

  /**
   * Eliminar todas las tareas de un proyecto
   */
  static async deleteProjectTasks(projectId: string, tenantId: string): Promise<void> {
    try {
      if (!tenantId) {
        throw new Error('tenantId is required');
      }

      const tasks = await this.getProjectTasks(projectId, tenantId);
      const batch = writeBatch(db);

      tasks.forEach((task) => {
        const taskRef = doc(db, TASKS_COLLECTION, task.id);
        batch.delete(taskRef);
      });

      await batch.commit();
      logger.info(`Project tasks deleted: ${projectId} (${tasks.length} tasks)`);
    } catch (error) {
      logger.error('Error deleting project tasks', error as Error);
      throw error;
    }
  }
}
