/**
 * ZADIA OS - Invoice Form Initial Data
 * Datos iniciales del formulario
 * Rule #5: Max 200 lines per file
 */

import { format } from 'date-fns';
import type { InvoiceFormData } from './types';

/**
 * Datos iniciales del formulario de factura
 */
export const initialFormData: InvoiceFormData = {
  clientId: '',
  clientName: '',
  items: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      subtotal: 0,
      unitOfMeasure: 'pza',
    },
  ],
  currency: 'USD',
  issueDate: format(new Date(), 'yyyy-MM-dd'),
  dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
  paymentTerms: '30 días',
  notes: '',
};
