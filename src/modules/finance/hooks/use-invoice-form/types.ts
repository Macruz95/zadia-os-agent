/**
 * ZADIA OS - Use Invoice Form Types
 * Types para hook de formulario de facturas
 * Rule #5: Max 200 lines per file
 */

import type { InvoiceItem } from '../../types/finance.types';

/**
 * Datos del formulario de factura
 */
export interface InvoiceFormData {
  clientId: string;
  clientName: string;
  quoteId?: string;
  quoteNumber?: string;
  orderId?: string;
  orderNumber?: string;
  projectId?: string;
  items: InvoiceItem[];
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
}

/**
 * Return type del hook useInvoiceForm
 */
export interface UseInvoiceFormReturn {
  formData: InvoiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
  loading: boolean;
  loadingQuote: boolean;
  loadingOrder: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
