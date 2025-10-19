/**
 * ZADIA OS - Work Order Status Service
 * Gestión de estados y progreso
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ChangeWorkOrderStatusInput } from '../../validations/work-orders.validation';
import { ProjectsService } from '../projects.service';
import { getWorkOrderById } from './work-order-crud.service';

/**
 * Cambiar estado de la orden
 * @param input - Datos validados con Zod
 */
export async function changeStatus(
  input: ChangeWorkOrderStatusInput
): Promise<void> {
  try {
    const workOrder = await getWorkOrderById(input.workOrderId);

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
      component: 'WorkOrdersService',
    });
  } catch (error) {
    logger.error('Error changing work order status', error as Error);
    throw new Error('Error al cambiar estado de la orden');
  }
}

/**
 * Actualizar progreso de la orden
 * @param workOrderId - ID de la orden
 * @param progressPercent - Porcentaje (0-100)
 */
export async function updateProgress(
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
      component: 'WorkOrdersService',
    });
  } catch (error) {
    logger.error('Error updating work order progress', error as Error);
    throw new Error('Error al actualizar progreso');
  }
}
