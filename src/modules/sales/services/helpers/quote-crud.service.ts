/**
 * ZADIA OS - Quote CRUD Service
 * Operaciones básicas de creación, lectura, actualización y eliminación
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Quote } from '../../types/sales.types';
import type { QuoteFormData } from '../../validations/sales.schema';
import { generateQuoteNumber, addIdsToItems, calculateTotals } from './quote-utils.service';

const QUOTES_COLLECTION = 'quotes';

/**
 * Crear nueva cotización
 */
export async function createQuote(
  data: QuoteFormData,
  createdBy: string
): Promise<Quote> {
  try {
    const now = Timestamp.fromDate(new Date());
    const quoteNumber = generateQuoteNumber();
    const itemsWithIds = addIdsToItems(data.items);

    const totals = calculateTotals(
      itemsWithIds,
      data.taxes || {},
      data.discounts || 0
    );

    const quoteData = {
      ...data,
      items: itemsWithIds,
      number: quoteNumber,
      ...totals,
      status: 'draft' as const,
      validUntil: data.validUntil
        ? Timestamp.fromDate(data.validUntil)
        : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      createdAt: now,
      updatedAt: now,
      assignedTo: createdBy,
    };

    const docRef = await addDoc(collection(db, QUOTES_COLLECTION), quoteData);

    const newQuote: Quote = {
      ...quoteData,
      id: docRef.id,
    };

    logger.info('Quote created successfully', {
      component: 'QuotesService',
      action: 'create',
      metadata: { quoteId: docRef.id }
    });

    return newQuote;
  } catch (error) {
    logger.error('Error creating quote', error as Error, {
      component: 'QuotesService',
      action: 'create'
    });
    throw new Error('Failed to create quote');
  }
}

/**
 * Obtener cotización por ID
 */
export async function getQuoteById(id: string): Promise<Quote | null> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      validUntil: data.validUntil?.toDate() || new Date(),
      sentAt: data.sentAt?.toDate() || undefined,
      acceptedAt: data.acceptedAt?.toDate() || undefined,
      rejectedAt: data.rejectedAt?.toDate() || undefined,
    } as Quote;
  } catch (error) {
    logger.error('Error fetching quote', error as Error, {
      component: 'QuotesService',
      action: 'getById'
    });
    throw new Error('Failed to fetch quote');
  }
}

/**
 * Actualizar cotización
 */
export async function updateQuote(
  id: string,
  updates: Partial<QuoteFormData>
): Promise<void> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, id);

    // Recalcular totales si cambiaron items, taxes o discounts
    let updateData: Record<string, unknown> = { ...updates };
    
    if (updates.items || updates.taxes || updates.discounts) {
      const currentQuote = await getQuoteById(id);
      if (currentQuote) {
        const items = updates.items
          ? addIdsToItems(updates.items)
          : currentQuote.items;
        const taxes = updates.taxes || currentQuote.taxes;
        const discounts = updates.discounts || currentQuote.discounts;

        const totals = calculateTotals(items, taxes, discounts);
        updateData = { ...updateData, items, ...totals };
      }
    }

    updateData.updatedAt = Timestamp.fromDate(new Date());

    await updateDoc(docRef, updateData);
    
    logger.info('Quote updated successfully', {
      component: 'QuotesService',
      action: 'update',
      metadata: { quoteId: id }
    });
  } catch (error) {
    logger.error('Error updating quote', error as Error, {
      component: 'QuotesService',
      action: 'update'
    });
    throw new Error('Failed to update quote');
  }
}

/**
 * Eliminar cotización
 */
export async function deleteQuote(id: string): Promise<void> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, id);
    await deleteDoc(docRef);
    
    logger.info('Quote deleted successfully', {
      component: 'QuotesService',
      action: 'delete',
      metadata: { quoteId: id }
    });
  } catch (error) {
    logger.error('Error deleting quote', error as Error, {
      component: 'QuotesService',
      action: 'delete'
    });
    throw new Error('Failed to delete quote');
  }
}
