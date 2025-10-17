// src/modules/projects/hooks/use-work-orders.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { WorkOrdersService } from '../services/work-orders.service';
import type { WorkOrder } from '../types/projects.types';
import { logger } from '@/lib/logger';

/**
 * Hook para gestionar órdenes de trabajo de un proyecto
 * Seguimiento de producción, materiales y horas
 */
export function useWorkOrders(projectId: string) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Cargar órdenes de trabajo del proyecto
   */
  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orders = await WorkOrdersService.getWorkOrdersByProject(projectId);
      setWorkOrders(orders);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Error fetching work orders', error);
      toast.error('Error al cargar órdenes de trabajo');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refrescar lista
   */
  const refreshWorkOrders = () => {
    fetchWorkOrders();
  };

  /**
   * Cambiar estado de una orden
   */
  const changeStatus = async (
    workOrderId: string,
    newStatus: 'pending' | 'in-progress' | 'paused' | 'completed' | 'cancelled',
    userId: string,
    userName: string,
    notes?: string
  ) => {
    try {
      await WorkOrdersService.changeStatus({
        workOrderId,
        newStatus,
        userId,
        userName,
        notes,
      });

      toast.success('Estado actualizado correctamente');
      await fetchWorkOrders();
    } catch (err) {
      const error = err as Error;
      logger.error('Error changing work order status', error);
      toast.error(error.message || 'Error al cambiar estado');
      throw error;
    }
  };

  /**
   * Registrar consumo de material
   */
  const recordMaterial = async (
    workOrderId: string,
    rawMaterialId: string,
    quantityUsed: number,
    userId: string,
    userName: string
  ) => {
    try {
      await WorkOrdersService.recordMaterialConsumption({
        workOrderId,
        rawMaterialId,
        quantityUsed,
        userId,
        userName,
      });

      toast.success('Material consumido registrado');
      await fetchWorkOrders();
    } catch (err) {
      const error = err as Error;
      logger.error('Error recording material', error);
      toast.error(error.message || 'Error al registrar material');
      throw error;
    }
  };

  /**
   * Registrar horas de trabajo
   */
  const recordHours = async (
    workOrderId: string,
    hours: number,
    userId: string,
    userName: string,
    notes?: string
  ) => {
    try {
      await WorkOrdersService.recordLaborHours({
        workOrderId,
        hours,
        userId,
        userName,
        notes,
      });

      toast.success('Horas registradas correctamente');
      await fetchWorkOrders();
    } catch (err) {
      const error = err as Error;
      logger.error('Error recording hours', error);
      toast.error(error.message || 'Error al registrar horas');
      throw error;
    }
  };

  /**
   * Actualizar progreso
   */
  const updateProgress = async (
    workOrderId: string,
    progressPercent: number
  ) => {
    try {
      await WorkOrdersService.updateProgress(workOrderId, progressPercent);
      toast.success('Progreso actualizado');
      await fetchWorkOrders();
    } catch (err) {
      const error = err as Error;
      logger.error('Error updating progress', error);
      toast.error('Error al actualizar progreso');
      throw error;
    }
  };

  // Cargar al montar
  useEffect(() => {
    if (projectId) {
      fetchWorkOrders();
    }
  }, [projectId]);

  // Estadísticas calculadas
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter((wo) => wo.status === 'pending').length,
    inProgress: workOrders.filter((wo) => wo.status === 'in-progress').length,
    completed: workOrders.filter((wo) => wo.status === 'completed').length,
    totalCost: workOrders.reduce((sum, wo) => sum + wo.actualCost, 0),
    totalHours: workOrders.reduce((sum, wo) => sum + wo.laborHours, 0),
  };

  return {
    workOrders,
    isLoading,
    error,
    stats,
    refreshWorkOrders,
    changeStatus,
    recordMaterial,
    recordHours,
    updateProgress,
  };
}
