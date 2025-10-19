/**
 * ZADIA OS - Orders Search Service
 * Búsqueda y filtrado de pedidos
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Order, OrderFilters } from '../../types/orders.types';

/**
 * Buscar pedidos con filtros
 * @param filters - Filtros opcionales
 * @returns Array de pedidos
 */
export async function searchOrders(filters: OrderFilters = {}): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    let q = query(ordersRef, orderBy('orderDate', 'desc'));

    // Aplicar filtros Firestore
    if (filters.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.paymentStatus) {
      q = query(q, where('paymentStatus', '==', filters.paymentStatus));
    }
    if (filters.shippingMethod) {
      q = query(q, where('shippingMethod', '==', filters.shippingMethod));
    }

    // Limitar resultados
    q = query(q, limit(100));

    const snapshot = await getDocs(q);
    let orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    // Filtros adicionales en memoria (fechas)
    if (filters.startDate) {
      orders = orders.filter((order) => {
        const orderDate =
          order.orderDate instanceof Date
            ? order.orderDate
            : order.orderDate.toDate();
        return orderDate >= filters.startDate!;
      });
    }
    if (filters.endDate) {
      orders = orders.filter((order) => {
        const orderDate =
          order.orderDate instanceof Date
            ? order.orderDate
            : order.orderDate.toDate();
        return orderDate <= filters.endDate!;
      });
    }

    return orders;
  } catch (error) {
    logger.error('Error searching orders', error as Error);
    return [];
  }
}
