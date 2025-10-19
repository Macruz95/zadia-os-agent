/**
 * ZADIA OS - Orders Utils Service
 * Utilidades y funciones auxiliares
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

/**
 * Generar número de pedido automático
 * @returns Número de pedido (ORD-YYYY-NNN)
 */
export async function generateOrderNumber(): Promise<string> {
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
}
