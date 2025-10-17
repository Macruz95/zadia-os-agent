// src/modules/finance/types/finance.types.ts

import { Timestamp } from 'firebase/firestore';

/**
 * Estado de Factura
 */
export type InvoiceStatus =
  | 'draft'          // Borrador
  | 'sent'           // Enviada
  | 'partially-paid' // Pagada Parcialmente
  | 'paid'           // Pagada
  | 'overdue'        // Vencida
  | 'cancelled';     // Cancelada

/**
 * Tipo de Pago
 */
export type PaymentMethod =
  | 'cash'           // Efectivo
  | 'bank-transfer'  // Transferencia
  | 'credit-card'    // Tarjeta de crédito
  | 'debit-card'     // Tarjeta de débito
  | 'check'          // Cheque
  | 'other';         // Otro

/**
 * Estado de Pago
 */
export type PaymentStatus =
  | 'pending'        // Pendiente
  | 'completed'      // Completado
  | 'failed'         // Fallido
  | 'cancelled';     // Cancelado

/**
 * Ítem de Factura
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  unitOfMeasure: string;
}

/**
 * Factura - Entidad principal
 * Generada desde cotizaciones aceptadas
 */
export interface Invoice {
  id: string;
  
  // Información básica
  number: string;                    // INV-2025-001
  status: InvoiceStatus;
  
  // Relaciones
  clientId: string;
  clientName: string;
  quoteId?: string;                  // Cotización origen (opcional)
  quoteNumber?: string;
  projectId?: string;                // Proyecto relacionado (opcional)
  
  // Ítems
  items: InvoiceItem[];
  
  // Montos
  subtotal: number;
  taxes: Record<string, number>;     // { "IVA": 16 }
  discounts: number;
  total: number;
  amountPaid: number;                // Total pagado
  amountDue: number;                 // Saldo pendiente
  currency: string;
  
  // Fechas
  issueDate: Timestamp;              // Fecha de emisión
  dueDate: Timestamp;                // Fecha de vencimiento
  paidDate?: Timestamp;              // Fecha de pago completo
  
  // Términos
  paymentTerms: string;
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Pago - Registro de pago aplicado a factura
 */
export interface Payment {
  id: string;
  
  // Información básica
  invoiceId: string;
  invoiceNumber: string;
  
  // Relaciones
  clientId: string;
  clientName: string;
  
  // Monto
  amount: number;
  currency: string;
  
  // Método de pago
  method: PaymentMethod;
  status: PaymentStatus;
  
  // Referencias
  reference?: string;                // Número de transacción/cheque
  notes?: string;
  
  // Fechas
  paymentDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Usuario
  recordedBy: string;
  recordedByName: string;
}

/**
 * Datos para crear factura
 */
export type CreateInvoiceData = Omit<
  Invoice,
  'id' | 'amountPaid' | 'amountDue' | 'paidDate' | 'createdAt' | 'updatedAt'
>;

/**
 * Datos para actualizar factura
 */
export type UpdateInvoiceData = Partial<
  Omit<Invoice, 'id' | 'number' | 'createdAt' | 'createdBy'>
>;

/**
 * Datos para crear pago
 */
export type CreatePaymentData = Omit<
  Payment,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Datos para actualizar pago
 */
export type UpdatePaymentData = Partial<
  Omit<Payment, 'id' | 'invoiceId' | 'createdAt' | 'recordedBy'>
>;

/**
 * Filtros de búsqueda de facturas
 */
export interface InvoiceFilters {
  clientId?: string;
  status?: InvoiceStatus;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  overdue?: boolean;
}

/**
 * Estadísticas de facturación
 */
export interface InvoiceStats {
  totalInvoices: number;
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  overdueInvoices: number;
  overdueAmount: number;
}

/**
 * Configuración de estados
 */
export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-500' },
  sent: { label: 'Enviada', color: 'bg-blue-500' },
  'partially-paid': { label: 'Pagada Parcialmente', color: 'bg-yellow-500' },
  paid: { label: 'Pagada', color: 'bg-green-500' },
  overdue: { label: 'Vencida', color: 'bg-red-500' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-400' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string }> = {
  cash: { label: 'Efectivo' },
  'bank-transfer': { label: 'Transferencia Bancaria' },
  'credit-card': { label: 'Tarjeta de Crédito' },
  'debit-card': { label: 'Tarjeta de Débito' },
  check: { label: 'Cheque' },
  other: { label: 'Otro' },
};
