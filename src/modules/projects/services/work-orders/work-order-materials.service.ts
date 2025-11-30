/**
 * ZADIA OS - Work Order Materials Service
 * Gestión de consumo de materiales
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { RecordMaterialConsumptionInput } from '../../validations/work-orders.validation';
import { ProjectsService } from '../projects.service';
import { getWorkOrderById } from './work-order-crud.service';

/**
 * Registrar consumo de material
 * @param input - Datos validados con Zod
 */
export async function recordMaterialConsumption(
  input: RecordMaterialConsumptionInput
): Promise<void> {
  try {
    const workOrder = await getWorkOrderById(input.workOrderId);

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
    const actualCost =
      totalMaterialsCost + workOrder.laborHours * workOrder.laborCostPerHour;

    const workOrderRef = doc(db, 'workOrders', input.workOrderId);
    await updateDoc(workOrderRef, {
      materials: updatedMaterials,
      actualCost,
      updatedAt: Timestamp.now(),
    });

    // Actualizar costos del proyecto (materialsCost y actualCost)
    const projectRef = doc(db, 'projects', workOrder.projectId);
    const materialCostIncrement = input.quantityUsed * material.unitCost;
    await updateDoc(projectRef, {
      materialsCost: increment(materialCostIncrement),
      actualCost: increment(materialCostIncrement),
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
      component: 'WorkOrdersService',
    });
  } catch (error) {
    logger.error('Error recording material consumption', error as Error);
    throw error;
  }
}
