/**
 * ZADIA OS - Orders CRUD Service
 * Operaciones básicas de creación, lectura y actualización
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Order } from '../../types/orders.types';
import { orderSchema } from '../../validations/orders.validation';

/**
 * Crear nuevo pedido
 * @param orderData - Datos del pedido
 * @param tenantId - Required tenant ID for data isolation
 * @returns ID del pedido creado
 */
export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  tenantId?: string
): Promise<string> {
  if (!tenantId) {
    throw new Error('tenantId is required for data isolation');
  }
  
  try {
    // Validar datos
    orderSchema.parse(orderData);

    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      tenantId, // CRITICAL: Add tenant isolation
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error creating order', error as Error);
    throw error;
  }
}

/**
 * Obtener pedido por ID
 * @param orderId - ID del pedido
 * @returns Pedido o null
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
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
}

/**
 * Actualizar pedido
 * @param orderId - ID del pedido
 * @param updates - Datos a actualizar
 */
export async function updateOrder(
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
}
