/**
 * ZADIA OS - Quote Search Service
 * Búsqueda y filtrado de cotizaciones
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Quote } from '../../types/sales.types';

const QUOTES_COLLECTION = 'quotes';

/**
 * Convertir documento Firestore a Quote
 */
function docToQuote(doc: QueryDocumentSnapshot<DocumentData>): Quote {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    validUntil: data.validUntil?.toDate() || new Date(),
    sentAt: data.sentAt?.toDate() || undefined,
    acceptedAt: data.acceptedAt?.toDate() || undefined,
    rejectedAt: data.rejectedAt?.toDate() || undefined,
  } as Quote;
}

/**
 * Obtener todas las cotizaciones
 */
export async function getAllQuotes(): Promise<Quote[]> {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];

    querySnapshot.forEach((doc) => {
      quotes.push(docToQuote(doc));
    });

    return quotes;
  } catch (error) {
    logger.error('Error fetching quotes', error as Error, {
      component: 'QuotesService',
      action: 'getAll'
    });
    throw new Error('Failed to fetch quotes');
  }
}

/**
 * Obtener cotizaciones por oportunidad
 */
export async function getQuotesByOpportunity(
  opportunityId: string
): Promise<Quote[]> {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('opportunityId', '==', opportunityId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];

    querySnapshot.forEach((doc) => {
      quotes.push(docToQuote(doc));
    });

    return quotes;
  } catch (error) {
    logger.error('Error fetching quotes by opportunity', error as Error, {
      component: 'QuotesService',
      action: 'getByOpportunity',
      metadata: { opportunityId }
    });
    throw new Error('Failed to fetch quotes by opportunity');
  }
}

/**
 * Obtener cotizaciones por estado
 */
export async function getQuotesByStatus(
  status: Quote['status']
): Promise<Quote[]> {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];

    querySnapshot.forEach((doc) => {
      quotes.push(docToQuote(doc));
    });

    return quotes;
  } catch (error) {
    logger.error('Error fetching quotes by status', error as Error, {
      component: 'QuotesService',
      action: 'getByStatus',
      metadata: { status }
    });
    throw new Error('Failed to fetch quotes by status');
  }
}
