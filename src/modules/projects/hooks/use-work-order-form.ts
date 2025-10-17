// src/modules/projects/hooks/use-work-order-form.ts

import { useState } from 'react';
import { toast } from 'sonner';
import { WorkOrdersService } from '../services/work-orders.service';
import type { CreateWorkOrderInput } from '../validations/work-orders.validation';
import { logger } from '@/lib/logger';

/**
 * Hook para formulario de creación de órdenes de trabajo
 */
export function useWorkOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Crear orden de trabajo
   * @param data - Datos validados con Zod
   * @returns ID de la orden creada
   */
  const createWorkOrder = async (
    data: CreateWorkOrderInput
  ): Promise<string> => {
    try {
      setIsSubmitting(true);

      const workOrderId = await WorkOrdersService.createWorkOrder(data);

      toast.success('Orden de trabajo creada correctamente');
      logger.info('Work order created successfully', { component: 'useWorkOrderForm' });

      return workOrderId;
    } catch (error) {
      const err = error as Error;
      logger.error('Error creating work order', err);
      toast.error(err.message || 'Error al crear orden de trabajo');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calcular costo estimado basado en materiales y horas
   */
  const calculateEstimatedCost = (
    materials: Array<{ quantityRequired: number; unitCost: number }>,
    estimatedHours: number,
    laborCostPerHour: number
  ): number => {
    const materialsCost = materials.reduce(
      (sum, m) => sum + m.quantityRequired * m.unitCost,
      0
    );

    const laborCost = estimatedHours * laborCostPerHour;

    return materialsCost + laborCost;
  };

  return {
    isSubmitting,
    createWorkOrder,
    calculateEstimatedCost,
  };
}
