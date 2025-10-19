/**
 * ZADIA OS - Project Costs Service
 * Gestión de costos de proyectos
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { getProjectById } from './project-crud.service';

/**
 * Actualizar costos del proyecto
 * @param projectId - ID del proyecto
 * @param costs - Costos a actualizar
 */
export async function updateCosts(
  projectId: string,
  costs: {
    materialsCost?: number;
    laborCost?: number;
    overheadCost?: number;
  }
): Promise<void> {
  try {
    const project = await getProjectById(projectId);

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
}
