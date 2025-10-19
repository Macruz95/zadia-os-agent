/**
 * ZADIA OS - Quote Status Service
 * Gestión de estados de cotizaciones
 * Rule #5: Max 200 lines per file
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Quote } from '../../types/sales.types';

const QUOTES_COLLECTION = 'quotes';

/**
 * Actualizar estado de la cotización
 */
export async function updateQuoteStatus(
  id: string,
  status: Quote['status']
): Promise<void> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, id);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Establecer timestamp basado en el estado
    if (status === 'sent') {
      updateData.sentAt = Timestamp.fromDate(new Date());
    } else if (status === 'accepted') {
      updateData.acceptedAt = Timestamp.fromDate(new Date());
    } else if (status === 'rejected') {
      updateData.rejectedAt = Timestamp.fromDate(new Date());
    }

    await updateDoc(docRef, updateData);
    
    logger.info('Quote status updated', {
      component: 'QuotesService',
      action: 'updateStatus',
      metadata: { quoteId: id, status }
    });
  } catch (error) {
    logger.error('Error updating quote status', error as Error, {
      component: 'QuotesService',
      action: 'updateStatus'
    });
    throw new Error('Failed to update quote status');
  }
}
