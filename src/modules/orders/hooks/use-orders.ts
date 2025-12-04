import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { OrdersService } from '../services/orders.service';
import { useTenantId } from '@/contexts/TenantContext';
import type {
  Order,
  OrderFilters,
  OrderStats,
  OrderStatus,
  TrackingInfo,
} from '../types/orders.types';

export function useOrders(filters?: OrderFilters) {
  const tenantId = useTenantId();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar pedidos
   */
  const fetchOrders = async () => {
    if (!tenantId) return; // Wait for tenant
    
    try {
      setLoading(true);
      setError(null);
      const data = await OrdersService.searchOrders(filters, tenantId);
      setOrders(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar pedidos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const fetchStats = async (clientId?: string) => {
    if (!tenantId) return; // Wait for tenant
    
    try {
      const data = await OrdersService.getOrderStats(clientId, tenantId);
      setStats(data);
    } catch {
      toast.error('Error al cargar estadísticas');
    }
  };

  /**
   * Crear pedido
   */
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    if (!tenantId) {
      toast.error('No tenant ID');
      return null;
    }
    
    try {
      const orderId = await OrdersService.createOrder(orderData, tenantId);
      toast.success('Pedido creado exitosamente');
      await fetchOrders();
      return orderId;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear pedido';
      toast.error(errorMessage);
      return null;
    }
  };

  /**
   * Actualizar pedido
   */
  const updateOrder = async (
    orderId: string,
    updates: Partial<Order>
  ): Promise<boolean> => {
    try {
      await OrdersService.updateOrder(orderId, updates);
      toast.success('Pedido actualizado exitosamente');
      await fetchOrders();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar pedido';
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Actualizar estado del pedido
   */
  const updateStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      await OrdersService.updateOrderStatus(orderId, status, notes);
      toast.success('Estado actualizado exitosamente');
      await fetchOrders();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar estado';
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Agregar tracking
   */
  const addTracking = async (
    orderId: string,
    tracking: TrackingInfo
  ): Promise<boolean> => {
    try {
      await OrdersService.addTracking(orderId, tracking);
      toast.success('Información de envío agregada');
      await fetchOrders();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al agregar información de envío';
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Cancelar pedido
   */
  const cancelOrder = async (
    orderId: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      await OrdersService.cancelOrder(orderId, reason);
      toast.success('Pedido cancelado');
      await fetchOrders();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cancelar pedido';
      toast.error(errorMessage);
      return false;
    }
  };

  /**
   * Generar número de pedido
   */
  const generateNumber = async (): Promise<string> => {
    try {
      return await OrdersService.generateOrderNumber();
    } catch {
      toast.error('Error al generar número de pedido');
      return '';
    }
  };

  // Cargar datos iniciales y cuando cambie el tenant
  useEffect(() => {
    if (tenantId) {
      fetchOrders();
    }
  }, [tenantId]);

  return {
    orders,
    stats,
    loading,
    error,
    fetchOrders,
    fetchStats,
    createOrder,
    updateOrder,
    updateStatus,
    addTracking,
    cancelOrder,
    generateNumber,
  };
}
