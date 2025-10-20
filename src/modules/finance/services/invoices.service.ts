/**
 * ZADIA OS - Invoices Service (Facade)
 * Punto de entrada unificado para operaciones de facturas
 * Rule #5: Max 200 lines per file
 */

// CRUD Operations
export {
  createInvoice,
  getInvoiceById,
  updateInvoice
} from './helpers/invoice-crud.service';

// Search Operations
export {
  searchInvoices
} from './helpers/invoice-search.service';

// Payment Operations
export {
  applyPayment
} from './helpers/invoice-payments.service';

// Statistics
export {
  getInvoiceStats
} from './helpers/invoice-stats.service';

// Utilities
export {
  generateInvoiceNumber
} from './helpers/invoice-utils.service';

/**
 * InvoicesService Object - Backward Compatibility
 */
import * as InvoiceCRUD from './helpers/invoice-crud.service';
import * as InvoiceSearch from './helpers/invoice-search.service';
import * as InvoicePayments from './helpers/invoice-payments.service';
import * as InvoiceStats from './helpers/invoice-stats.service';
import * as InvoiceUtils from './helpers/invoice-utils.service';

export const InvoicesService = {
  createInvoice: InvoiceCRUD.createInvoice,
  getInvoiceById: InvoiceCRUD.getInvoiceById,
  updateInvoice: InvoiceCRUD.updateInvoice,
  searchInvoices: InvoiceSearch.searchInvoices,
  applyPayment: InvoicePayments.applyPayment,
  getInvoiceStats: InvoiceStats.getInvoiceStats,
  generateInvoiceNumber: InvoiceUtils.generateInvoiceNumber,
};
