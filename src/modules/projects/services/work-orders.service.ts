// src/modules/projects/services/work-orders.service.ts

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
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type {
  WorkOrder,
} from '../types/projects.types';
import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  RecordMaterialConsumptionInput,
  RecordLaborHoursInput,
  ChangeWorkOrderStatusInput,
} from '../validations/work-orders.validation';
import { ProjectsService } from './projects.service';

/**
 * Servicio de Órdenes de Trabajo
 * Maneja todas las operaciones CRUD con Firebase Firestore
 * NO usa mocks ni datos hardcodeados
 */
export const WorkOrdersService = {
  /**
   * Crear una nueva orden de trabajo
   * @param workOrderData - Datos validados con Zod
   * @returns ID de la orden creada
   */
  async createWorkOrder(workOrderData: CreateWorkOrderInput): Promise<string> {
    try {
      const workOrdersRef = collection(db, 'workOrders');

      const newWorkOrder = {
        ...workOrderData,
        // Valores iniciales
        progressPercent: 0,
        laborHours: 0,
        actualCost: 0,
        actualStartDate: null,
        actualEndDate: null,
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(workOrdersRef, newWorkOrder);

      // Registrar en timeline del proyecto
      await ProjectsService.addTimelineEntry({
        projectId: workOrderData.projectId,
        type: 'note',
        title: 'Orden de trabajo creada',
        description: `Orden "${workOrderData.name}" - Fase: ${workOrderData.phase}`,
        performedBy: workOrderData.createdBy,
        performedByName: 'Usuario',
        performedAt: Timestamp.now(),
      });

      logger.info('Work order created', { component: 'WorkOrdersService' });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating work order', error as Error);
      throw new Error('Error al crear la orden de trabajo');
    }
  },

  /**
   * Obtener orden de trabajo por ID
   * @param workOrderId - ID de la orden
   * @returns Orden o null si no existe
   */
  async getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
    try {
      const workOrderRef = doc(db, 'workOrders', workOrderId);
      const workOrderDoc = await getDoc(workOrderRef);

      if (!workOrderDoc.exists()) {
        return null;
      }

      return {
        id: workOrderDoc.id,
        ...workOrderDoc.data(),
      } as WorkOrder;
    } catch (error) {
      logger.error('Error fetching work order', error as Error);
      throw new Error('Error al obtener la orden de trabajo');
    }
  },

  /**
   * Obtener todas las órdenes de un proyecto
   * @param projectId - ID del proyecto
   * @returns Lista de órdenes ordenadas por fecha de creación
   */
  async getWorkOrdersByProject(projectId: string): Promise<WorkOrder[]> {
    try {
      const workOrdersRef = collection(db, 'workOrders');
      const q = query(
        workOrdersRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkOrder[];
    } catch (error) {
      logger.error('Error fetching work orders', error as Error);
      return [];
    }
  },

  /**
   * Actualizar orden de trabajo
   * @param workOrderId - ID de la orden
   * @param updates - Datos a actualizar validados con Zod
   */
  async updateWorkOrder(
    workOrderId: string,
    updates: UpdateWorkOrderInput
  ): Promise<void> {
    try {
      const workOrderRef = doc(db, 'workOrders', workOrderId);

      await updateDoc(workOrderRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      logger.info('Work order updated', { component: 'WorkOrdersService' });
    } catch (error) {
      logger.error('Error updating work order', error as Error);
      throw new Error('Error al actualizar la orden de trabajo');
    }
  },

  /**
   * Cambiar estado de la orden
   * @param input - Datos validados con Zod
   */
  async changeStatus(input: ChangeWorkOrderStatusInput): Promise<void> {
    try {
      const workOrder = await this.getWorkOrderById(input.workOrderId);

      if (!workOrder) {
        throw new Error('Orden de trabajo no encontrada');
      }

      const workOrderRef = doc(db, 'workOrders', input.workOrderId);
      const updates: Record<string, unknown> = {
        status: input.newStatus,
        updatedAt: Timestamp.now(),
      };

      // Actualizar fechas según el estado
      if (input.newStatus === 'in-progress' && !workOrder.actualStartDate) {
        updates.actualStartDate = Timestamp.now();
      }
      if (input.newStatus === 'completed') {
        updates.actualEndDate = Timestamp.now();
        updates.progressPercent = 100;
      }

      await updateDoc(workOrderRef, updates);

      // Registrar en timeline
      await ProjectsService.addTimelineEntry({
        projectId: workOrder.projectId,
        type: 'status-change',
        title: 'Estado de orden actualizado',
        description: `"${workOrder.name}" cambió a: ${input.newStatus}${
          input.notes ? ` - ${input.notes}` : ''
        }`,
        performedBy: input.userId,
        performedByName: input.userName,
        performedAt: Timestamp.now(),
      });

      logger.info('Work order status changed', { 
        component: 'WorkOrdersService'
      });
    } catch (error) {
      logger.error('Error changing work order status', error as Error);
      throw new Error('Error al cambiar estado de la orden');
    }
  },

  /**
   * Registrar consumo de material
   * @param input - Datos validados con Zod
   */
  async recordMaterialConsumption(
    input: RecordMaterialConsumptionInput
  ): Promise<void> {
    try {
      const workOrder = await this.getWorkOrderById(input.workOrderId);

      if (!workOrder) {
        throw new Error('Orden de trabajo no encontrada');
      }

      // Buscar el material en la lista
      const materialIndex = workOrder.materials.findIndex(
        (m) => m.rawMaterialId === input.rawMaterialId
      );

      if (materialIndex === -1) {
        throw new Error('Material no encontrado en la orden');
      }

      const material = workOrder.materials[materialIndex];
      const newQuantityUsed = material.quantityUsed + input.quantityUsed;

      // Validar que no exceda cantidad requerida
      if (newQuantityUsed > material.quantityRequired) {
        throw new Error('La cantidad usada excede la cantidad requerida');
      }

      // Actualizar material
      const updatedMaterials = [...workOrder.materials];
      updatedMaterials[materialIndex] = {
        ...material,
        quantityUsed: newQuantityUsed,
        totalCost: newQuantityUsed * material.unitCost,
      };

      // Calcular costo total de materiales
      const totalMaterialsCost = updatedMaterials.reduce(
        (sum, m) => sum + m.totalCost,
        0
      );

      // Calcular costo total de la orden
      const actualCost = totalMaterialsCost + (workOrder.laborHours * workOrder.laborCostPerHour);

      const workOrderRef = doc(db, 'workOrders', input.workOrderId);
      await updateDoc(workOrderRef, {
        materials: updatedMaterials,
        actualCost,
        updatedAt: Timestamp.now(),
      });

      // Actualizar costos del proyecto
      const projectRef = doc(db, 'projects', workOrder.projectId);
      await updateDoc(projectRef, {
        materialsCost: increment(input.quantityUsed * material.unitCost),
        updatedAt: Timestamp.now(),
      });

      // Registrar en timeline
      await ProjectsService.addTimelineEntry({
        projectId: workOrder.projectId,
        type: 'material-consumed',
        title: 'Material consumido',
        description: `${input.quantityUsed} ${material.unitOfMeasure} de ${material.rawMaterialName}`,
        performedBy: input.userId,
        performedByName: input.userName,
        performedAt: Timestamp.now(),
      });

      logger.info('Material consumption recorded', {
        component: 'WorkOrdersService'
      });
    } catch (error) {
      logger.error('Error recording material consumption', error as Error);
      throw error;
    }
  },

  /**
   * Registrar horas de trabajo
   * @param input - Datos validados con Zod
   */
  async recordLaborHours(input: RecordLaborHoursInput): Promise<void> {
    try {
      const workOrder = await this.getWorkOrderById(input.workOrderId);

      if (!workOrder) {
        throw new Error('Orden de trabajo no encontrada');
      }

      const newLaborHours = workOrder.laborHours + input.hours;
      const laborCost = input.hours * workOrder.laborCostPerHour;

      // Calcular costo total de materiales
      const totalMaterialsCost = workOrder.materials.reduce(
        (sum, m) => sum + m.totalCost,
        0
      );

      // Calcular costo total actualizado
      const actualCost = totalMaterialsCost + (newLaborHours * workOrder.laborCostPerHour);

      const workOrderRef = doc(db, 'workOrders', input.workOrderId);
      await updateDoc(workOrderRef, {
        laborHours: newLaborHours,
        actualCost,
        updatedAt: Timestamp.now(),
      });

      // Actualizar costos del proyecto
      const projectRef = doc(db, 'projects', workOrder.projectId);
      await updateDoc(projectRef, {
        laborCost: increment(laborCost),
        updatedAt: Timestamp.now(),
      });

      // Registrar en timeline
      await ProjectsService.addTimelineEntry({
        projectId: workOrder.projectId,
        type: 'note',
        title: 'Horas registradas',
        description: `${input.hours} horas en "${workOrder.name}"${
          input.notes ? ` - ${input.notes}` : ''
        }`,
        performedBy: input.userId,
        performedByName: input.userName,
        performedAt: Timestamp.now(),
      });

      logger.info('Labor hours recorded', {
        component: 'WorkOrdersService'
      });
    } catch (error) {
      logger.error('Error recording labor hours', error as Error);
      throw new Error('Error al registrar horas de trabajo');
    }
  },

  /**
   * Actualizar progreso de la orden
   * @param workOrderId - ID de la orden
   * @param progressPercent - Porcentaje (0-100)
   */
  async updateProgress(
    workOrderId: string,
    progressPercent: number
  ): Promise<void> {
    try {
      const workOrderRef = doc(db, 'workOrders', workOrderId);

      await updateDoc(workOrderRef, {
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        updatedAt: Timestamp.now(),
      });

      logger.info('Work order progress updated', {
        component: 'WorkOrdersService'
      });
    } catch (error) {
      logger.error('Error updating work order progress', error as Error);
      throw new Error('Error al actualizar progreso');
    }
  },
};
