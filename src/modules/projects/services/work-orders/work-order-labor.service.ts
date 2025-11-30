/**
 * ZADIA OS - Work Order Labor Service
 * Gestión de horas de trabajo
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { RecordLaborHoursInput } from '../../validations/work-orders.validation';
import { ProjectsService } from '../projects.service';
import { getWorkOrderById } from './work-order-crud.service';

/**
 * Registrar horas de trabajo
 * @param input - Datos validados con Zod
 */
export async function recordLaborHours(
  input: RecordLaborHoursInput
): Promise<void> {
  try {
    const workOrder = await getWorkOrderById(input.workOrderId);

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
    const actualCost =
      totalMaterialsCost + newLaborHours * workOrder.laborCostPerHour;

    const workOrderRef = doc(db, 'workOrders', input.workOrderId);
    await updateDoc(workOrderRef, {
      laborHours: newLaborHours,
      actualCost,
      updatedAt: Timestamp.now(),
    });

    // Actualizar costos del proyecto (laborCost y actualCost)
    const projectRef = doc(db, 'projects', workOrder.projectId);
    await updateDoc(projectRef, {
      laborCost: increment(laborCost),
      actualCost: increment(laborCost),
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
      component: 'WorkOrdersService',
    });
  } catch (error) {
    logger.error('Error recording labor hours', error as Error);
    throw new Error('Error al registrar horas de trabajo');
  }
}
