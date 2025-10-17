// src/modules/projects/services/projects.service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type {
  Project,
  ProjectSearchParams,
  ProjectStatus,
  ProjectTimelineEntry,
} from '../types/projects.types';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../validations/projects.validation';

/**
 * Servicio de Proyectos
 * Maneja todas las operaciones CRUD con Firebase Firestore
 * NO usa mocks ni datos hardcodeados
 */
export const ProjectsService = {
  /**
   * Crear un nuevo proyecto
   * @param projectData - Datos del proyecto validados con Zod
   * @returns ID del proyecto creado
   */
  async createProject(projectData: CreateProjectInput): Promise<string> {
    try {
      const projectsRef = collection(db, 'projects');

      const newProject = {
        ...projectData,
        // Valores iniciales calculados
        actualCost: 0,
        materialsCost: 0,
        laborCost: 0,
        overheadCost: 0,
        progressPercent: 0,
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(projectsRef, newProject);

      // Crear entrada en timeline
      await this.addTimelineEntry({
        projectId: docRef.id,
        type: 'status-change',
        title: 'Proyecto creado',
        description: `Proyecto "${projectData.name}" creado${
          projectData.quoteNumber ? ` desde cotización ${projectData.quoteNumber}` : ''
        }`,
        performedBy: projectData.createdBy,
        performedByName: 'Sistema',
        performedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating project', error as Error);
      throw new Error('Error al crear el proyecto');
    }
  },

  /**
   * Obtener proyecto por ID
   * @param projectId - ID del proyecto
   * @returns Proyecto o null si no existe
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        return null;
      }

      return {
        id: projectDoc.id,
        ...projectDoc.data(),
      } as Project;
    } catch (error) {
      logger.error('Error fetching project', error as Error);
      throw new Error('Error al obtener el proyecto');
    }
  },

  /**
   * Buscar proyectos con filtros
   * @param params - Parámetros de búsqueda validados
   * @returns Lista de proyectos y total
   */
  async searchProjects(params: ProjectSearchParams = {}): Promise<{
    projects: Project[];
    totalCount: number;
  }> {
    try {
      const projectsRef = collection(db, 'projects');
      let q = query(projectsRef);

      // Aplicar filtros
      if (params.status) {
        q = query(q, where('status', '==', params.status));
      }
      if (params.priority) {
        q = query(q, where('priority', '==', params.priority));
      }
      if (params.clientId) {
        q = query(q, where('clientId', '==', params.clientId));
      }
      if (params.projectManager) {
        q = query(q, where('projectManager', '==', params.projectManager));
      }

      // Ordenar
      const sortField = params.sortBy || 'createdAt';
      const sortDirection = params.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Limitar resultados
      if (params.pageSize) {
        q = query(q, limit(params.pageSize));
      }

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      return {
        projects,
        totalCount: projects.length,
      };
    } catch (error) {
      logger.error('Error searching projects', error as Error);
      throw new Error('Error al buscar proyectos');
    }
  },

  /**
   * Actualizar proyecto
   * @param projectId - ID del proyecto
   * @param updates - Datos a actualizar validados con Zod
   */
  async updateProject(
    projectId: string,
    updates: UpdateProjectInput
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error updating project', error as Error);
      throw new Error('Error al actualizar el proyecto');
    }
  },

  /**
   * Actualizar estado del proyecto
   * @param projectId - ID del proyecto
   * @param newStatus - Nuevo estado
   * @param userId - ID del usuario que realiza el cambio
   * @param userName - Nombre del usuario
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: ProjectStatus,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });

      // Registrar en timeline
      await this.addTimelineEntry({
        projectId,
        type: 'status-change',
        title: 'Estado actualizado',
        description: `Proyecto cambió a estado: ${newStatus}`,
        performedBy: userId,
        performedByName: userName,
        performedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error updating project status', error as Error);
      throw new Error('Error al actualizar estado del proyecto');
    }
  },

  /**
   * Actualizar progreso del proyecto
   * @param projectId - ID del proyecto
   * @param progressPercent - Porcentaje de progreso (0-100)
   */
  async updateProgress(
    projectId: string,
    progressPercent: number
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error updating project progress', error as Error);
      throw new Error('Error al actualizar progreso');
    }
  },

  /**
   * Actualizar costos del proyecto
   * @param projectId - ID del proyecto
   * @param costs - Costos a actualizar
   */
  async updateCosts(
    projectId: string,
    costs: {
      materialsCost?: number;
      laborCost?: number;
      overheadCost?: number;
    }
  ): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);

      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      const updatedMaterialsCost = costs.materialsCost ?? project.materialsCost;
      const updatedLaborCost = costs.laborCost ?? project.laborCost;
      const updatedOverheadCost = costs.overheadCost ?? project.overheadCost;

      const actualCost =
        updatedMaterialsCost + updatedLaborCost + updatedOverheadCost;

      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        materialsCost: updatedMaterialsCost,
        laborCost: updatedLaborCost,
        overheadCost: updatedOverheadCost,
        actualCost,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error updating project costs', error as Error);
      throw new Error('Error al actualizar costos');
    }
  },

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

  /**
   * Eliminar proyecto (solo admin)
   * Elimina proyecto y sus datos relacionados en transacción
   * @param projectId - ID del proyecto a eliminar
   */
  async deleteProject(projectId: string): Promise<void> {
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

      await batch.commit();
    } catch (error) {
      logger.error('Error deleting project', error as Error);
      throw new Error('Error al eliminar el proyecto');
    }
  },
};
