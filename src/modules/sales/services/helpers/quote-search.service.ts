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
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Quote } from '../../types/sales.types';

const QUOTES_COLLECTION = 'quotes';

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
 * Convertir documento Firestore a Quote
 */
function docToQuote(doc: QueryDocumentSnapshot<DocumentData>): Quote {
  const data = doc.data() as Partial<Quote>;
  return ({
    ...data,
    id: doc.id,
    createdAt: toTimestampSafe(data.createdAt) || Timestamp.fromDate(new Date()),
    updatedAt: toTimestampSafe(data.updatedAt) || Timestamp.fromDate(new Date()),
    validUntil: toTimestampSafe(data.validUntil) || Timestamp.fromDate(new Date()),
    sentAt: toTimestampSafe(data.sentAt),
    acceptedAt: toTimestampSafe(data.acceptedAt),
    rejectedAt: toTimestampSafe(data.rejectedAt),
  } as unknown) as Quote;
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

/**
 * Obtener cotizaciones por cliente
 */
export async function getQuotesByClient(
  clientId: string
): Promise<Quote[]> {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quotes: Quote[] = [];

    querySnapshot.forEach((doc) => {
      quotes.push(docToQuote(doc));
    });

    return quotes;
  } catch (error) {
    logger.error('Error fetching quotes by client', error as Error, {
      component: 'QuotesService',
      action: 'getByClient',
      metadata: { clientId }
    });
    throw new Error('Failed to fetch quotes by client');
  }
}
