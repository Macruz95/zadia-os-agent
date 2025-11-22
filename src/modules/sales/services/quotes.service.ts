/**
 * ZADIA OS - Quotes Service (Facade)
 * Punto de entrada unificado para operaciones de cotizaciones
 * Rule #5: Max 200 lines per file
 */

// CRUD Operations
export {
  createQuote,
  getQuoteById,
  updateQuote,
  deleteQuote
} from './helpers/quote-crud.service';

// Search Operations
export {
  getAllQuotes,
  getQuotesByOpportunity,
  getQuotesByStatus,
  getQuotesByClient
} from './helpers/quote-search.service';

// Status Management
export {
  updateQuoteStatus
} from './helpers/quote-status.service';

// Utilities
export {
  generateQuoteNumber,
  addIdsToItems,
  calculateTotals
} from './helpers/quote-utils.service';

/**
 * QuotesService Class - Backward Compatibility
 */
import * as QuoteCRUD from './helpers/quote-crud.service';
import * as QuoteSearch from './helpers/quote-search.service';
import * as QuoteStatus from './helpers/quote-status.service';
import * as QuoteUtils from './helpers/quote-utils.service';

export class QuotesService {
  static createQuote = QuoteCRUD.createQuote;
  static getQuoteById = QuoteCRUD.getQuoteById;
  static updateQuote = QuoteCRUD.updateQuote;
  static deleteQuote = QuoteCRUD.deleteQuote;
  static getQuotes = QuoteSearch.getAllQuotes;
  static getQuotesByOpportunity = QuoteSearch.getQuotesByOpportunity;
  static getQuotesByStatus = QuoteSearch.getQuotesByStatus;
  static getQuotesByClient = QuoteSearch.getQuotesByClient;
  static updateQuoteStatus = QuoteStatus.updateQuoteStatus;
  static generateQuoteNumber = QuoteUtils.generateQuoteNumber;
  static addIdsToItems = QuoteUtils.addIdsToItems;
  static calculateTotals = QuoteUtils.calculateTotals;
}
