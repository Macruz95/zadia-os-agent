/**
 * ZADIA OS - Orders Stats Service
 * Cálculo de estadísticas y métricas
 * Rule #5: Max 200 lines per file
 */

import { logger } from '@/lib/logger';
import type { OrderStats, OrderFilters } from '../../types/orders.types';
import { searchOrders } from './order-search.service';

/**
 * Obtener estadísticas de pedidos
 * @param clientId - ID del cliente (opcional)
 * @param tenantId - Required tenant ID for data isolation
 * @returns Estadísticas calculadas
 */
export async function getOrderStats(clientId?: string, tenantId?: string): Promise<OrderStats> {
  if (!tenantId) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
    };
  }
  
  try {
    const filters: OrderFilters = {};
    if (clientId) filters.clientId = clientId;

    const orders = await searchOrders(filters, tenantId);

    const stats: OrderStats = {
      totalOrders: orders.length,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
    };

    orders.forEach((order) => {
      // Solo contar revenue de pedidos no cancelados
      if (order.status !== 'cancelled') {
        stats.totalRevenue += order.total;
      }

      // Clasificar por estado
      switch (order.status) {
        case 'pending':
        case 'confirmed':
        case 'processing':
        case 'ready':
          stats.pendingOrders++;
          break;
        case 'shipped':
          stats.shippedOrders++;
          break;
        case 'delivered':
          stats.deliveredOrders++;
          break;
        case 'cancelled':
          stats.cancelledOrders++;
          break;
      }
    });

    // Calcular promedio
    stats.averageOrderValue =
      stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

    return stats;
  } catch (error) {
    logger.error('Error calculating order stats', error as Error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
    };
  }
}
