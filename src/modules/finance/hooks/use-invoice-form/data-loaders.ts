/**
 * ZADIA OS - Invoice Form Data Loaders
 * Funciones para cargar datos desde cotizaciones y pedidos
 * Rule #5: Max 200 lines per file
 */

import { format } from 'date-fns';
import { toast } from 'sonner';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import { OrdersService } from '@/modules/orders/services/orders.service';
import type { InvoiceFormData } from './types';

/**
 * Cargar datos desde una cotización
 */
export async function loadQuoteData(quoteId: string): Promise<InvoiceFormData | null> {
  try {
    const quote = await QuotesService.getQuoteById(quoteId);

    if (!quote) {
      toast.error('Cotización no encontrada');
      return null;
    }

    toast.success('Datos cargados desde cotización');

    return {
      clientId: quote.clientId,
      clientName: 'Cliente',
      quoteId: quote.id,
      quoteNumber: quote.number,
      projectId: undefined,
      items: quote.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: item.subtotal,
        unitOfMeasure: item.unitOfMeasure || 'pza',
      })),
      currency: quote.currency,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
      paymentTerms: quote.paymentTerms || '30 días',
      notes: quote.notes || '',
    };
  } catch {
    toast.error('Error al cargar la cotización');
    return null;
  }
}

/**
 * Cargar datos desde un pedido
 */
export async function loadOrderData(orderId: string): Promise<InvoiceFormData | null> {
  try {
    const order = await OrdersService.getOrderById(orderId);

    if (!order) {
      toast.error('Pedido no encontrado');
      return null;
    }

    toast.success('Datos cargados desde pedido');

    return {
      clientId: order.clientId,
      clientName: order.clientName,
      orderId: order.id,
      orderNumber: order.number,
      quoteId: order.quoteId,
      quoteNumber: order.quoteNumber,
      items: order.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: item.subtotal,
        unitOfMeasure: item.unitOfMeasure || 'pza',
      })),
      currency: order.currency,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
      paymentTerms: '30 días',
      notes: order.notes || '',
    };
  } catch {
    toast.error('Error al cargar el pedido');
    return null;
  }
}
