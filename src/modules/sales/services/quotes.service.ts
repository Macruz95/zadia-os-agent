/**/**/**

 * ZADIA OS - Quotes Service (Facade)

 * Punto de entrada unificado para operaciones de cotizaciones * ZADIA OS - Quotes Service (Facade) * ZADIA OS - Quotes Service

 * Rule #5: Max 200 lines per file

 */ * Punto de entrada unificado para operaciones de cotizaciones * 



// CRUD Operations * Rule #5: Max 200 lines per file * Handles all quote operations with Firebase integration

export {

  createQuote, *  */

  getQuoteById,

  updateQuote, * Arquitectura modular:

  deleteQuote

} from './helpers/quote-crud.service'; * - quote-utils: Utilidades y cálculosimport { 



// Search Operations * - quote-crud: Operaciones CRUD básicas  collection, 

export {

  getAllQuotes, * - quote-search: Búsqueda y filtrado  doc, 

  getQuotesByOpportunity,

  getQuotesByStatus * - quote-status: Gestión de estados  getDocs, 

} from './helpers/quote-search.service';

 */  getDoc, 

// Status Management

export {  addDoc, 

  updateQuoteStatus

} from './helpers/quote-status.service';// CRUD Operations  updateDoc, 



// Utilitiesexport {  deleteDoc, 

export {

  generateQuoteNumber,  createQuote,  query, 

  addIdsToItems,

  calculateTotals  getQuoteById,  where, 

} from './helpers/quote-utils.service';

  updateQuote,  orderBy,

/**

 * QuotesService Class - Backward Compatibility  deleteQuote  Timestamp

 */

import * as QuoteCRUD from './helpers/quote-crud.service';} from './helpers/quote-crud.service';} from 'firebase/firestore';

import * as QuoteSearch from './helpers/quote-search.service';

import * as QuoteStatus from './helpers/quote-status.service';import { db } from '@/lib/firebase';

import * as QuoteUtils from './helpers/quote-utils.service';

// Search Operationsimport { logger } from '@/lib/logger';

export class QuotesService {

  static createQuote = QuoteCRUD.createQuote;export {import { Quote } from '../types/sales.types';

  static getQuoteById = QuoteCRUD.getQuoteById;

  static updateQuote = QuoteCRUD.updateQuote;  getAllQuotes,import { QuoteFormData } from '../validations/sales.schema';

  static deleteQuote = QuoteCRUD.deleteQuote;

  static getQuotes = QuoteSearch.getAllQuotes;  getQuotesByOpportunity,

  static getQuotesByOpportunity = QuoteSearch.getQuotesByOpportunity;

  static getQuotesByStatus = QuoteSearch.getQuotesByStatus;  getQuotesByStatusconst QUOTES_COLLECTION = 'quotes';

  static updateQuoteStatus = QuoteStatus.updateQuoteStatus;

  static generateQuoteNumber = QuoteUtils.generateQuoteNumber;} from './helpers/quote-search.service';

  static addIdsToItems = QuoteUtils.addIdsToItems;

  static calculateTotals = QuoteUtils.calculateTotals;export class QuotesService {

}

// Status Management  /**

export {   * Generate quote number

  updateQuoteStatus   */

} from './helpers/quote-status.service';  private static generateQuoteNumber(): string {

    const year = new Date().getFullYear();

// Utilities    const month = String(new Date().getMonth() + 1).padStart(2, '0');

export {    const timestamp = Date.now().toString().slice(-6);

  generateQuoteNumber,    return `COT-${year}-${month}-${timestamp}`;

  addIdsToItems,  }

  calculateTotals

} from './helpers/quote-utils.service';  /**

   * Add IDs to quote items

/**   */

 * QuotesService Class (Backward Compatibility)  private static addIdsToItems(items: Omit<Quote['items'][0], 'id'>[]): Quote['items'] {

 *     return items.map((item, index) => ({

 * Esta clase mantiene la interfaz pública original para no romper      ...item,

 * código existente que use QuotesService.metodo()      id: `item-${Date.now()}-${index}`

 */    }));

import * as QuoteCRUD from './helpers/quote-crud.service';  }

import * as QuoteSearch from './helpers/quote-search.service';

import * as QuoteStatus from './helpers/quote-status.service';  /**

import * as QuoteUtils from './helpers/quote-utils.service';   * Calculate quote totals

   */

export class QuotesService {  private static calculateTotals(items: Quote['items'] | Omit<Quote['items'][0], 'id'>[], taxes: Record<string, number>, discounts: number) {

  // CRUD Operations    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  static createQuote = QuoteCRUD.createQuote;    const totalTaxes = Object.values(taxes).reduce((sum, rate) => sum + (subtotal * rate / 100), 0);

  static getQuoteById = QuoteCRUD.getQuoteById;    const total = subtotal + totalTaxes - discounts;

  static updateQuote = QuoteCRUD.updateQuote;    

  static deleteQuote = QuoteCRUD.deleteQuote;    return {

      subtotal,

  // Search Operations      totalTaxes,

  static getQuotes = QuoteSearch.getAllQuotes;      total

  static getQuotesByOpportunity = QuoteSearch.getQuotesByOpportunity;    };

  static getQuotesByStatus = QuoteSearch.getQuotesByStatus;  }



  // Status Management  /**

  static updateQuoteStatus = QuoteStatus.updateQuoteStatus;   * Create a new quote

   */

  // Utilities (private in original, exposed for flexibility)  static async createQuote(data: QuoteFormData, createdBy: string): Promise<Quote> {

  static generateQuoteNumber = QuoteUtils.generateQuoteNumber;    try {

  static addIdsToItems = QuoteUtils.addIdsToItems;      const now = Timestamp.fromDate(new Date());

  static calculateTotals = QuoteUtils.calculateTotals;      const quoteNumber = this.generateQuoteNumber();

}      const itemsWithIds = this.addIdsToItems(data.items);

      
      const totals = this.calculateTotals(itemsWithIds, data.taxes || {}, data.discounts || 0);
      
      const quoteData = {
        ...data,
        items: itemsWithIds,
        number: quoteNumber,
        ...totals,
        status: 'draft' as const,
        validUntil: data.validUntil ? Timestamp.fromDate(data.validUntil) : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
        createdAt: now,
        updatedAt: now,
        assignedTo: createdBy,
      };

      const docRef = await addDoc(collection(db, QUOTES_COLLECTION), quoteData);
      
      const newQuote: Quote = {
        ...quoteData,
        id: docRef.id,
      };

      logger.info('Quote created successfully', { component: 'QuotesService', action: 'create' });
      return newQuote;
    } catch (error) {
      logger.error('Error creating quote', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to create quote');
    }
  }

  /**
   * Get all quotes
   */
  static async getQuotes(): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, QUOTES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const quotes: Quote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quotes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate() || undefined,
          acceptedAt: data.acceptedAt?.toDate() || undefined,
          rejectedAt: data.rejectedAt?.toDate() || undefined,
        } as Quote);
      });

      return quotes;
    } catch (error) {
      logger.error('Error fetching quotes', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch quotes');
    }
  }

  /**
   * Get quote by ID
   */
  static async getQuoteById(id: string): Promise<Quote | null> {
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
      logger.error('Error fetching quote', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch quote');
    }
  }

  /**
   * Update quote
   */
  static async updateQuote(id: string, updates: Partial<QuoteFormData>): Promise<void> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, id);
      
      // Recalculate totals if items, taxes, or discounts changed
      let updateData: Record<string, unknown> = { ...updates };
      if (updates.items || updates.taxes || updates.discounts) {
        const currentQuote = await this.getQuoteById(id);
        if (currentQuote) {
          const items = updates.items ? this.addIdsToItems(updates.items) : currentQuote.items;
          const taxes = updates.taxes || currentQuote.taxes;
          const discounts = updates.discounts || currentQuote.discounts;
          
          const totals = this.calculateTotals(items, taxes, discounts);
          updateData = { ...updateData, items, ...totals };
        }
      }

      updateData.updatedAt = Timestamp.fromDate(new Date());

      await updateDoc(docRef, updateData);
      logger.info('Quote updated successfully', { component: 'QuotesService', action: 'update' });
    } catch (error) {
      logger.error('Error updating quote', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to update quote');
    }
  }

  /**
   * Update quote status
   */
  static async updateQuoteStatus(id: string, status: Quote['status']): Promise<void> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, id);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Set timestamp based on status
      if (status === 'sent') {
        updateData.sentAt = Timestamp.fromDate(new Date());
      } else if (status === 'accepted') {
        updateData.acceptedAt = Timestamp.fromDate(new Date());
      } else if (status === 'rejected') {
        updateData.rejectedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(docRef, updateData);
      logger.info('Quote status updated', { component: 'QuotesService', action: 'updateStatus' });
    } catch (error) {
      logger.error('Error updating quote status', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to update quote status');
    }
  }

  /**
   * Delete quote
   */
  static async deleteQuote(id: string): Promise<void> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, id);
      await deleteDoc(docRef);
      logger.info('Quote deleted successfully', { component: 'QuotesService', action: 'delete' });
    } catch (error) {
      logger.error('Error deleting quote', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to delete quote');
    }
  }

  /**
   * Get quotes by opportunity
   */
  static async getQuotesByOpportunity(opportunityId: string): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, QUOTES_COLLECTION),
        where('opportunityId', '==', opportunityId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const quotes: Quote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quotes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate() || undefined,
          acceptedAt: data.acceptedAt?.toDate() || undefined,
          rejectedAt: data.rejectedAt?.toDate() || undefined,
        } as Quote);
      });

      return quotes;
    } catch (error) {
      logger.error('Error fetching quotes by opportunity', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch quotes by opportunity');
    }
  }

  /**
   * Get quotes by status
   */
  static async getQuotesByStatus(status: Quote['status']): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, QUOTES_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const quotes: Quote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quotes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate() || undefined,
          acceptedAt: data.acceptedAt?.toDate() || undefined,
          rejectedAt: data.rejectedAt?.toDate() || undefined,
        } as Quote);
      });

      return quotes;
    } catch (error) {
      logger.error('Error fetching quotes by status', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch quotes by status');
    }
  }
}