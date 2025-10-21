/**
 * ZADIA OS - Work Order CRUD Operations
 * Operaciones básicas de creación, lectura y actualización
 * Rule #5: Max 200 lines per file
 */

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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { WorkOrder } from '../../types/projects.types';
import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
} from '../../validations/work-orders.validation';
import { ProjectsService } from '../projects.service';

/**
 * Crear una nueva orden de trabajo
 * @param workOrderData - Datos validados con Zod
 * @returns ID de la orden creada
 */
export async function createWorkOrder(
  workOrderData: CreateWorkOrderInput
): Promise<string> {
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
}

/**
 * Obtener orden de trabajo por ID
 * @param workOrderId - ID de la orden
 * @returns Orden o null si no existe
 */
export async function getWorkOrderById(
  workOrderId: string
): Promise<WorkOrder | null> {
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
}

/**
 * Obtener todas las órdenes de un proyecto
 * @param projectId - ID del proyecto
 * @returns Lista de órdenes ordenadas por fecha de creación
 */
export async function getWorkOrdersByProject(
  projectId: string
): Promise<WorkOrder[]> {
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
}

/**
 * Actualizar orden de trabajo
 * @param workOrderId - ID de la orden
 * @param updates - Datos a actualizar validados con Zod
 */
export async function updateWorkOrder(
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
}

/**
 * Export service object for consistency
 */
export const WorkOrdersService = {
  createWorkOrder,
  getWorkOrderById,
  getWorkOrdersByProject,
  updateWorkOrder,
};
