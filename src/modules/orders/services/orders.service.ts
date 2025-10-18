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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Order,
  OrderFilters,
  OrderStats,
  OrderStatus,
  TrackingInfo,
} from '../types/orders.types';
import { orderSchema } from '../validations/orders.validation';

/**
 * Logger simple
 */
const logger = {
  error: (message: string, error: Error) => {
    // eslint-disable-next-line no-console
    console.error(`[OrdersService] ${message}:`, error);
  },
};

export const OrdersService = {
  /**
   * Crear nuevo pedido
   * @param orderData - Datos del pedido
   * @returns ID del pedido creado
   */
  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      // Validar datos
      orderSchema.parse(orderData);

      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating order', error as Error);
      throw error;
    }
  },

  /**
   * Obtener pedido por ID
   * @param orderId - ID del pedido
   * @returns Pedido o null
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        return null;
      }

      return {
        id: orderSnap.id,
        ...orderSnap.data(),
      } as Order;
    } catch (error) {
      logger.error('Error getting order by ID', error as Error);
      return null;
    }
  },

  /**
   * Buscar pedidos con filtros
   * @param filters - Filtros opcionales
   * @returns Array de pedidos
   */
  async searchOrders(filters: OrderFilters = {}): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      let q = query(ordersRef, orderBy('orderDate', 'desc'));

      // Aplicar filtros
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

      // Filtros adicionales (fecha)
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
  },

  /**
   * Actualizar pedido
   * @param orderId - ID del pedido
   * @param updates - Datos a actualizar
   */
  async updateOrder(
    orderId: string,
    updates: Partial<Order>
  ): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error updating order', error as Error);
      throw error;
    }
  },

  /**
   * Actualizar estado del pedido
   * @param orderId - ID del pedido
   * @param status - Nuevo estado
   * @param notes - Notas opcionales
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (notes) {
        updates.internalNotes = notes;
      }

      // Si se marca como enviado, agregar fecha
      if (status === 'shipped' && !updates.shippedDate) {
        updates.shippedDate = Timestamp.now();
      }

      // Si se marca como entregado, agregar fecha
      if (status === 'delivered' && !updates.deliveredDate) {
        updates.deliveredDate = Timestamp.now();
      }

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updates);
    } catch (error) {
      logger.error('Error updating order status', error as Error);
      throw error;
    }
  },

  /**
   * Agregar información de tracking
   * @param orderId - ID del pedido
   * @param tracking - Información de tracking
   */
  async addTracking(
    orderId: string,
    tracking: TrackingInfo
  ): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        tracking,
        status: 'shipped',
        shippedDate: tracking.shippedDate,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Error adding tracking', error as Error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pedidos
   * @param clientId - ID del cliente (opcional)
   * @returns Estadísticas calculadas
   */
  async getOrderStats(clientId?: string): Promise<OrderStats> {
    try {
      const filters: OrderFilters = {};
      if (clientId) filters.clientId = clientId;

      const orders = await this.searchOrders(filters);

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
        if (order.status !== 'cancelled') {
          stats.totalRevenue += order.total;
        }

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

      stats.averageOrderValue =
        stats.totalOrders > 0
          ? stats.totalRevenue / stats.totalOrders
          : 0;

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
  },

  /**
   * Generar número de pedido automático
   * @returns Número de pedido (ORD-YYYY-NNN)
   */
  async generateOrderNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const ordersRef = collection(db, 'orders');

      // Buscar último pedido del año
      const q = query(
        ordersRef,
        where('number', '>=', `ORD-${year}-`),
        where('number', '<', `ORD-${year + 1}-`),
        orderBy('number', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return `ORD-${year}-001`;
      }

      const lastNumber = snapshot.docs[0].data().number as string;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      const nextSequence = (lastSequence + 1).toString().padStart(3, '0');

      return `ORD-${year}-${nextSequence}`;
    } catch (error) {
      logger.error('Error generating order number', error as Error);
      const year = new Date().getFullYear();
      return `ORD-${year}-001`;
    }
  },

  /**
   * Cancelar pedido
   * @param orderId - ID del pedido
   * @param reason - Razón de cancelación
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      };

      if (reason) {
        updates.internalNotes = reason;
      }

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updates);
    } catch (error) {
      logger.error('Error cancelling order', error as Error);
      throw error;
    }
  },
};
