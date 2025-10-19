/**
 * ZADIA OS - Orders Status Service
 * Gestión de estados y tracking
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { OrderStatus, TrackingInfo } from '../../types/orders.types';

/**
 * Actualizar estado del pedido
 * @param orderId - ID del pedido
 * @param status - Nuevo estado
 * @param notes - Notas opcionales
 */
export async function updateOrderStatus(
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
}

/**
 * Agregar información de tracking
 * @param orderId - ID del pedido
 * @param tracking - Información de tracking
 */
export async function addTracking(
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
}

/**
 * Cancelar pedido
 * @param orderId - ID del pedido
 * @param reason - Razón de cancelación
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
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
}
