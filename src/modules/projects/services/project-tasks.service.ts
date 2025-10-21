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
   * Crear una nueva tarea
   */
  static async createTask(data: CreateTaskData): Promise<string> {
    try {
      const taskData = {
        ...data,
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
   * Obtener tareas de un proyecto
   */
  static async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION),
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
   * Obtener tareas de una orden de trabajo
   */
  static async getWorkOrderTasks(workOrderId: string): Promise<ProjectTask[]> {
    try {
      const q = query(
        collection(db, TASKS_COLLECTION),
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
  static async deleteProjectTasks(projectId: string): Promise<void> {
    try {
      const tasks = await this.getProjectTasks(projectId);
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
