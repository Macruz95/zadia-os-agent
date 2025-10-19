/**
 * ZADIA OS - Invoice Utils Service
 * Handles utility functions for invoices
 */

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const COLLECTION = 'invoices';

/**
 * Generate automatic invoice number
 * Format: INV-YYYY-NNN
 */
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    const invoicesRef = collection(db, COLLECTION);
    
    // Search for last invoice of the year
    const q = query(
      invoicesRef,
      where('number', '>=', `INV-${year}-`),
      where('number', '<', `INV-${year + 1}-`),
      orderBy('number', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return `INV-${year}-001`;
    }

    const lastNumber = snapshot.docs[0].data().number as string;
    const lastSequence = parseInt(lastNumber.split('-')[2]);
    const nextSequence = (lastSequence + 1).toString().padStart(3, '0');

    return `INV-${year}-${nextSequence}`;
  } catch (error) {
    logger.error('Error generating invoice number', error as Error, {
      component: 'InvoiceUtils',
      action: 'generateInvoiceNumber'
    });
    // Fallback: use timestamp
    const year = new Date().getFullYear();
    const sequence = Date.now().toString().slice(-3);
    return `INV-${year}-${sequence}`;
  }
}
