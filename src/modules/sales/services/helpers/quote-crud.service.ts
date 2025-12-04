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

function removeUndefinedDeep<T>(value: T): T {
  if (value instanceof Timestamp) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => removeUndefinedDeep(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined) {
        return;
      }
      const cleaned = removeUndefinedDeep(val);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    });
    return result as T;
  }

  return value;
}

function toTimestampSafe(value: unknown): Timestamp | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof (value as { seconds: unknown }).seconds === 'number' &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === 'number'
  ) {
    const { seconds, nanoseconds } = value as { seconds: number; nanoseconds: number };
    return new Timestamp(seconds, nanoseconds);
  }
  return undefined;
}

/**
 * Crear nueva cotización
 * @param tenantId - Required tenant ID for data isolation
 */
export async function createQuote(
  data: QuoteFormData,
  createdBy: string,
  tenantId?: string
): Promise<Quote> {
  if (!tenantId) {
    throw new Error('tenantId is required for data isolation');
  }
  
  try {
    const now = Timestamp.fromDate(new Date());
    const quoteNumber = generateQuoteNumber();
    const itemsWithIds = addIdsToItems(data.items);

    const totals = calculateTotals(
      itemsWithIds,
      data.taxes || {},
      data.discounts || 0
    );

    // Construir el objeto para Firestore sin campos undefined
    const quoteData: Partial<Quote> = {
      number: quoteNumber,
      tenantId, // CRITICAL: Add tenant isolation
      items: itemsWithIds,
      ...totals,
      status: 'draft' as const,
      validUntil: data.validUntil
        ? Timestamp.fromDate(data.validUntil)
        : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      createdAt: now,
      updatedAt: now,
      assignedTo: createdBy,
      clientId: data.clientId,
      contactId: data.contactId,
      currency: data.currency,
      taxes: data.taxes || {},
      paymentTerms: data.paymentTerms || '',
      discounts: data.discounts || 0,
    };

    // Agregar campos opcionales solo si tienen valor
    if (data.opportunityId) quoteData.opportunityId = data.opportunityId;
    if (data.notes) quoteData.notes = data.notes;
    if (data.internalNotes) quoteData.internalNotes = data.internalNotes;
    if (data.attachments) quoteData.attachments = data.attachments;

    const sanitizedQuoteData = removeUndefinedDeep(quoteData);

    const docRef = await addDoc(collection(db, QUOTES_COLLECTION), sanitizedQuoteData);

    const quotePayload = sanitizedQuoteData as Partial<Quote>;
    const newQuote = ({
      ...quotePayload,
      id: docRef.id,
      createdAt: toTimestampSafe(quotePayload.createdAt) || Timestamp.fromDate(new Date()),
      updatedAt: toTimestampSafe(quotePayload.updatedAt) || Timestamp.fromDate(new Date()),
      validUntil: toTimestampSafe(quotePayload.validUntil) || Timestamp.fromDate(new Date()),
      sentAt: toTimestampSafe(quotePayload.sentAt),
      acceptedAt: toTimestampSafe(quotePayload.acceptedAt),
      rejectedAt: toTimestampSafe(quotePayload.rejectedAt),
    } as unknown) as Quote;

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

    const data = docSnap.data() as Partial<Quote>;
    return ({
      ...data,
      id: docSnap.id,
      createdAt: toTimestampSafe(data.createdAt) || Timestamp.fromDate(new Date()),
      updatedAt: toTimestampSafe(data.updatedAt) || Timestamp.fromDate(new Date()),
      validUntil: toTimestampSafe(data.validUntil) || Timestamp.fromDate(new Date()),
      sentAt: toTimestampSafe(data.sentAt),
      acceptedAt: toTimestampSafe(data.acceptedAt),
      rejectedAt: toTimestampSafe(data.rejectedAt),
    } as unknown) as Quote;
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
